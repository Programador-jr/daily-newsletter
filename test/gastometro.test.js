const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const handler = require('../lib/api-handlers/public-data/gastometro');

const { projectCounter, readEntityCode, readUfCode, clearCache } = handler._internal;

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

function trpcResponse(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, headers: new Headers(), text: async () => JSON.stringify(payload) };
}

const asOf = new Date(Date.now() - 10_000).toISOString();

const SPENDING = {
  result: {
    data: {
      year: 2026,
      currency: 'BRL',
      as_of: asOf,
      entities: [
        { cod_ente: 0, label: 'Governo Geral', base_value: 1000, rate_per_second: 10 },
        { cod_ente: 1, label: 'União', base_value: 500, rate_per_second: 5 },
        { cod_ente: 2, label: 'Estados', base_value: 300, rate_per_second: 3 },
        { cod_ente: 3, label: 'Municípios', base_value: 200, rate_per_second: 2 }
      ],
      previdencia: { base_value: 250, rate_per_second: 2.5 }
    }
  }
};

function routeTrpc(routes) {
  return async url => {
    const { pathname, searchParams } = new URL(url);
    const procedure = pathname.split('/').pop();
    const input = searchParams.get('input');
    const route = routes[procedure];
    if (!route) return trpcResponse({ error: { message: 'unknown', data: { httpStatus: 404 } } }, 404);
    return typeof route === 'function' ? route(input ? JSON.parse(input) : undefined) : route;
  };
}

beforeEach(() => clearCache());

test('projects counters from the source reference instant', () => {
  const now = Date.parse('2026-11-08T00:00:10Z');
  assert.deepEqual(
    projectCounter({ base: 100, rate: 2.5, asOf: Date.parse('2026-11-08T00:00:00Z') }, now),
    { valor: 125, incrementoPorSegundo: 2.5 }
  );
});

test('accepts aggregate, state and municipality IBGE codes only', () => {
  assert.equal(readEntityCode('0'), 0);
  assert.equal(readEntityCode('35'), 35);
  assert.equal(readEntityCode('3550308'), 3550308);
  for (const invalid of ['4', '99', '9999999', '355030', 'abc', '', '-1']) {
    assert.throws(() => readEntityCode(invalid), error => error.status === 400, invalid);
  }
  assert.equal(readUfCode('sp'), 35);
  assert.equal(readUfCode('53'), 53);
  assert.throws(() => readUfCode('zz'), error => error.status === 400);
});

test('returns the national overview with spheres and pension share', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', routeTrpc({ 'counters.spending': trpcResponse(SPENDING) }));
  const response = createResponse();

  await handler({ query: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.fonte.id, 'gastobrasil');
  assert.deepEqual(response.body.entes.map(ente => ente.id), ['geral', 'uniao', 'estados', 'municipios']);
  const total = response.body.entes[0];
  assert.ok(total.valor >= 1100 && total.valor < 1120, String(total.valor));
  assert.equal(response.body.previdencia.participacao, 0.25);
  assert.match(response.headers['Cache-Control'], /s-maxage=300/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('reuses the in-memory cache between requests', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', routeTrpc({ 'counters.spending': trpcResponse(SPENDING) }));
  await handler({ query: {} }, createResponse());
  await handler({ query: {} }, createResponse());
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('returns an entity with pension and personnel by branch, sending the tRPC input', async t => {
  const inputs = [];
  t.mock.method(globalThis, 'fetch', routeTrpc({
    'counters.entity': input => {
      inputs.push(input);
      return trpcResponse({ result: { data: { cod_ente: 35, label: 'São Paulo', year: 2026, as_of: asOf, base_value: 1000, rate_per_second: 1 } } });
    },
    'previdencia.current': trpcResponse({ result: { data: { cod_ente: 35, as_of: asOf, base_value: 200, rate_per_second: 0.2 } } }),
    'poderes.current': trpcResponse({ result: { data: { cod_ente: 35, as_of: asOf, branches: [
      { esfera: 'judiciario', label: 'Judiciário', base_value: 50, rate_per_second: 0 },
      { esfera: 'executivo', label: 'Executivo', base_value: 400, rate_per_second: 0 },
      { esfera: 'defensoria_publica', label: 'Defensoria Pública', base_value: 0, rate_per_second: 0 }
    ] } } })
  }));
  const response = createResponse();

  await handler({ query: { ente: '35' } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(inputs, [{ cod_ente: 35 }]);
  assert.deepEqual(response.body.ente, { codigo: 35, id: 'sp', tipo: 'estado', nome: 'São Paulo' });
  assert.ok(response.body.previdencia.participacao > 0.19 && response.body.previdencia.participacao < 0.21);
  // Poderes sem gasto saem da lista; os demais vêm do maior para o menor.
  assert.deepEqual(response.body.pessoalPorPoder.map(item => item.id), ['executivo', 'judiciario']);
});

test('keeps the main counter when optional details fail', async t => {
  t.mock.method(globalThis, 'fetch', routeTrpc({
    'counters.entity': trpcResponse({ result: { data: { cod_ente: 3550308, label: 'São Paulo', year: 2026, as_of: asOf, base_value: 10, rate_per_second: 1 } } }),
    'previdencia.current': trpcResponse({ error: { message: 'boom', data: { httpStatus: 500 } } }, 500),
    'poderes.current': async () => { throw new Error('timeout'); }
  }));
  const response = createResponse();

  await handler({ query: { ente: '3550308' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ente.uf, 'sp');
  assert.equal(response.body.previdencia, undefined);
  assert.equal(response.body.pessoalPorPoder, undefined);
});

test('maps "no counter data" to 404 and outages to 502, without caching', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => trpcResponse({
    error: { message: 'no counter data for entity', data: { httpStatus: 500 } }
  }, 500));
  const missing = createResponse();
  await handler({ query: { ente: '3599999' } }, missing);
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.headers['Cache-Control'], undefined);

  fetchMock.mock.mockImplementation(async () => trpcResponse({ error: { message: 'db down', data: { httpStatus: 500 } } }, 500));
  const outage = createResponse();
  await handler({ query: {} }, outage);
  assert.equal(outage.statusCode, 502);
});

test('serves the last known overview, flagged as stale, when the source fails', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', routeTrpc({ 'counters.spending': trpcResponse(SPENDING) }));
  await handler({ query: {} }, createResponse());

  t.mock.method(Date, 'now', () => Date.parse(asOf) + 60 * 60 * 1000);
  fetchMock.mock.mockImplementation(async () => { throw new Error('offline'); });
  const response = createResponse();
  await handler({ query: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.desatualizado, true);
});

test('lists municipalities of a state and drops codes from other states', async t => {
  t.mock.method(globalThis, 'fetch', routeTrpc({
    'municipios.list': input => {
      assert.deepEqual(input, { uf: '35' });
      return trpcResponse({ result: { data: [
        { cod_ibge: 3550308, nome_municipio: 'São Paulo' },
        { cod_ibge: 3304557, nome_municipio: 'Rio de Janeiro' }
      ] } });
    }
  }));
  const response = createResponse();

  await handler({ query: { lista: 'municipios', uf: 'SP' } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.municipios, [{ codigo: 3550308, nome: 'São Paulo' }]);
});

test('rejects invalid parameters before calling the source', async t => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => trpcResponse({}));
  for (const query of [{ ente: '99' }, { lista: 'outra' }, { lista: 'municipios', uf: 'xx' }]) {
    const response = createResponse();
    await handler({ query }, response);
    assert.equal(response.statusCode, 400, JSON.stringify(query));
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});
