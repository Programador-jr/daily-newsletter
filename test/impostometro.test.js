const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const handler = require('../lib/api-handlers/public-data/impostometro');

const {
  buildAcspRequest,
  normalizeAcspCounter,
  parseBrasiliaDateTime,
  parseOrgCounter,
  periodFor,
  clearCache
} = handler._internal;

function createResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, headers: new Headers(), text: async () => JSON.stringify(body) };
}

const ORG_HTML = `<div id="counter-value">R$ 1</div>
  <div>Arrecadação Federal em 2026</div>
  <script>(function(){const initialValue = 547900000000;
  const incrementPerSecond = 91800;
  const baseDate = "2026-03-01T00:00:00-03:00";})();</script>`;

beforeEach(() => clearCache());

test('parses Brasília timestamps without timezone into UTC instants', () => {
  assert.equal(parseBrasiliaDateTime('2026-11-07T21:58:12.0810000').toISOString(), '2026-11-08T00:58:12.081Z');
  assert.equal(parseBrasiliaDateTime('2026-11-07T00:00:00').toISOString(), '2026-11-07T03:00:00.000Z');
  assert.equal(parseBrasiliaDateTime('invalid'), null);
});

test('projects the ACSP midnight value to the reference instant', () => {
  const counter = normalizeAcspCounter({
    Valor: 1000,
    Incremento: 2,
    Data: '2026-11-07T00:01:40.0000000',
    Midnight: '2026-11-07T00:00:00.0000000'
  });

  assert.equal(counter.valor, 1200);
  assert.equal(counter.incrementoPorSegundo, 2);
  assert.equal(counter.referencia, '2026-11-07T03:01:40.000Z');
});

test('treats an ACSP zero counter as missing data', () => {
  assert.throws(
    () => normalizeAcspCounter({ Valor: 0, Incremento: 0, Data: '2026-11-07T10:00:00', Midnight: '2026-11-07T00:00:00' }),
    error => error.status === 404
  );
});

test('extracts and projects the impostometro.org inline counter', () => {
  const now = Date.parse('2026-03-01T03:00:10Z');
  const counter = parseOrgCounter(ORG_HTML, now);

  assert.equal(counter.valor, 547900000000 + 10 * 91800);
  assert.equal(counter.incrementoPorSegundo, 91800);
  assert.equal(counter.ano, 2026);
  assert.equal(counter.parametros.dataBase, '2026-03-01T03:00:00.000Z');
});

test('fails clearly when impostometro.org changes its markup', () => {
  assert.throws(() => parseOrgCounter('<html></html>'), error => error.status === 502);
});

test('builds closed and current periods in the source date format', () => {
  const now = new Date('2026-11-08T00:58:00Z'); // 7/11/2026 21:58 em Brasília
  assert.deepEqual(periodFor(2026, now), {
    ano: 2026, inicio: '2026-01-01', fim: '2026-11-07', emAndamento: true,
    dataInicial: '01/01/2026', dataFinal: '07/11/2026'
  });
  assert.equal(periodFor(2025, now).dataFinal, '31/12/2025');
  assert.equal(periodFor(2025, now).emAndamento, false);
});

test('maps scopes to the upstream counter endpoints', () => {
  const now = new Date('2026-11-08T00:58:00Z');
  assert.match(buildAcspRequest({}, now).url, /\/Contador\/Brasil\?dataInicial=01%2F01%2F2026&dataFinal=07%2F11%2F2026$/);
  assert.match(buildAcspRequest({ escopo: 'estado', uf: 'SP' }, now).url, /\/Contador\/Estado\?estado=sp&/);
  assert.match(buildAcspRequest({ escopo: 'municipio', uf: 'rj', municipio: 'rio-de-janeiro' }, now).url, /\/Contador\/Municipios\?estado=rj&municipio=rio-de-janeiro&/);
  assert.match(buildAcspRequest({ escopo: 'tributo', esfera: 'estadual', tributo: 'icms', ano: '2024' }, now).url, /\/Contador\/Tributo\?esfera=estadual&tributo=icms&dataInicial=01%2F01%2F2024&dataFinal=31%2F12%2F2024$/);
});

test('rejects invalid filters before calling the source', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => jsonResponse({}));
  for (const query of [{ escopo: 'estado', uf: 'zz' }, { escopo: 'municipio', uf: 'sp', municipio: '../x' }, { ano: '1999' }, { escopo: 'outro' }, { lista: 'outra' }, { fonte: 'x' }]) {
    const response = createResponse();
    await handler({ query }, response);
    assert.equal(response.statusCode, 400, JSON.stringify(query));
    assert.ok(response.body.erro);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('returns a normalized, cacheable ACSP counter and sends the XHR header', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => jsonResponse({
    Valor: 3462928224434.9268,
    Incremento: 130263.71181108795,
    Data: '2026-11-07T21:53:33.9430000',
    Midnight: '2026-11-07T00:00:00.0000000'
  }));
  const response = createResponse();

  await handler({ query: { escopo: 'estado', uf: 'sp' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.fonte.id, 'acsp');
  assert.deepEqual(response.body.escopo, { tipo: 'estado', uf: 'sp' });
  assert.equal(response.body.incrementoPorSegundo, 130263.71);
  assert.ok(response.body.valor > 3462928224434.9268);
  assert.match(response.headers['Cache-Control'], /s-maxage=\d+/);
  const [, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(options.headers['X-Requested-With'], 'XMLHttpRequest');
});

test('reports a missing filter as 404 without caching', async t => {
  t.mock.method(globalThis, 'fetch', async () => jsonResponse({ Valor: 0, Incremento: 0, Data: '0001-01-01T00:00:00', Midnight: '0001-01-01T00:00:00' }));
  const response = createResponse();

  await handler({ query: { escopo: 'municipio', uf: 'sp', municipio: 'inexistente' } }, response);

  assert.equal(response.statusCode, 404);
  assert.equal(response.headers['Cache-Control'], undefined);
});

test('maps upstream redirects (error page) to 404 and outages to 502', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 302, headers: new Headers() }));
  const redirected = createResponse();
  await handler({ query: { escopo: 'estado', uf: 'mg' } }, redirected);
  assert.equal(redirected.statusCode, 404);

  fetchMock.mock.mockImplementation(async () => ({ ok: false, status: 503, headers: new Headers() }));
  const outage = createResponse();
  await handler({ query: { escopo: 'estado', uf: 'ba' } }, outage);
  assert.equal(outage.statusCode, 502);
});

function networkError(code) {
  const cause = Object.assign(new Error(`connect ${code} 167.249.156.37:443`), { code });
  return new TypeError('fetch failed', { cause });
}

test('maps network failures to 502 and logs the underlying cause', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw networkError('ECONNRESET'); });
  const logged = [];
  t.mock.method(console, 'error', message => logged.push(message));
  const response = createResponse();

  await handler({ query: {} }, response);

  assert.equal(response.statusCode, 502);
  assert.equal(response.body.erro, 'A fonte do Impostômetro está indisponível no momento.');
  assert.equal(logged.length, 1);
  const entry = JSON.parse(logged[0]);
  assert.equal(entry.event, 'impostometro.fetch_failed');
  assert.equal(entry.upstream, 'impostometro.com.br/Contador/Brasil');
  assert.equal(entry.error.message, 'fetch failed');
  assert.equal(entry.error.cause.code, 'ECONNRESET');
});

test('serves the last good counter as stale when the network fails', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => ORG_HTML }));
  t.mock.method(console, 'error', () => {});
  const realNow = Date.now;
  t.after(() => { Date.now = realNow; });

  const first = createResponse();
  await handler({ query: { fonte: 'org' } }, first);
  assert.equal(first.statusCode, 200);

  // Vence o TTL de 10 min e derruba a rede.
  const later = realNow() + 11 * 60 * 1000;
  Date.now = () => later;
  fetchMock.mock.mockImplementation(async () => { throw networkError('ECONNREFUSED'); });
  const second = createResponse();
  await handler({ query: { fonte: 'org' } }, second);

  assert.equal(second.statusCode, 200);
  assert.equal(second.body.desatualizado, true);
  assert.equal(fetchMock.mock.callCount(), 2);
});

test('serves the impostometro.org counter and reuses the in-memory cache', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200, headers: new Headers(), text: async () => ORG_HTML }));

  const first = createResponse();
  await handler({ query: { fonte: 'org' } }, first);
  const second = createResponse();
  await handler({ query: { fonte: 'org' } }, second);

  assert.equal(first.statusCode, 200);
  assert.equal(first.body.fonte.id, 'org');
  assert.equal(first.body.incrementoPorSegundo, 91800);
  assert.equal(second.statusCode, 200);
  assert.ok(second.body.valor >= first.body.valor);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('lists taxes per sphere, dropping malformed identifiers', async t => {
  t.mock.method(globalThis, 'fetch', async () => jsonResponse([
    { Nome: 'ICMS', Parametro: 'icms' },
    { Nome: 'Inválido', Parametro: '../x' }
  ]));
  const response = createResponse();

  await handler({ query: { lista: 'tributos', esfera: 'estadual' } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.tributos, [{ id: 'icms', nome: 'ICMS' }]);
});
