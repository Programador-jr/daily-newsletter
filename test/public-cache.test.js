const assert = require('node:assert/strict');
const { test } = require('node:test');
const { setPublicCache } = require('../lib/public-cache');

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
    type(value) {
      this.contentType = value;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('public cache policy sets shared-CDN TTL without enabling browser caching', () => {
  const response = createResponse();

  setPublicCache(response, 300, 600);

  assert.equal(
    response.headers['Cache-Control'],
    'public, max-age=0, s-maxage=300, stale-while-revalidate=600'
  );
});

test('public cache policy rejects invalid TTL values', () => {
  const response = createResponse();

  assert.throws(() => setPublicCache(response, -1, 60), RangeError);
  assert.throws(() => setPublicCache(response, 60, 1.5), RangeError);
});

test('Camara deputies endpoint marks successful upstream responses cacheable', async t => {
  const handler = require('../lib/api-handlers/public-data/camara-deputados');
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    text: async () => '{"dados":[]}'
  }));
  const response = createResponse();

  await handler({ query: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Cache-Control'], 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
});

test('Camara deputies endpoint does not cache upstream errors', async t => {
  const handler = require('../lib/api-handlers/public-data/camara-deputados');
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 503,
    text: async () => '{"erro":"indisponível"}'
  }));
  const response = createResponse();

  await handler({ query: {} }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.headers['Cache-Control'], undefined);
});

test('Camara expenses endpoint marks successful responses cacheable', async t => {
  const handler = require('../lib/api-handlers/public-data/camara-despesas');
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    text: async () => '{"dados":[]}'
  }));
  const response = createResponse();

  await handler({ query: { id: '123' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Cache-Control'], 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
});

test('Transferegov endpoint uses the shared CDN cache policy for successful data', async t => {
  const handler = require('../lib/api-handlers/public-data/transferegov-emendas');
  t.mock.method(globalThis, 'fetch', async () => new Response(
    JSON.stringify({ data: [], total_pages: 1 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  ));
  const response = createResponse();

  await handler({ query: { ano: '2025' } }, response);

  assert.equal(response.statusCode, null);
  assert.equal(response.headers['Cache-Control'], 'public, max-age=0, s-maxage=600, stale-while-revalidate=1200');
  assert.deepEqual(response.body.dados, []);
});
