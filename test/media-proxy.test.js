const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createMediaProxy } = require('../lib/media-proxy');

function createResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(body) { this.body = body; return this; },
    end() { return this; }
  };
}

const environment = { R2_PUBLIC_BASE_URL: 'https://media.example.com/' };

test('media proxy forwards catalog images from the public R2 bucket', async () => {
  const requested = [];
  const proxy = createMediaProxy({
    environment,
    fetchImpl: async url => {
      requested.push(url);
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' }
      });
    }
  });
  const response = createResponse();

  await proxy({ params: { path: ['personalities', 'portraits', 'ayn-rand.webp'] } }, response);

  assert.deepEqual(requested, ['https://media.example.com/personalities/portraits/ayn-rand.webp']);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'image/webp');
  assert.deepEqual([...response.body], [1, 2, 3]);
});

test('media proxy only serves known media folders', async () => {
  let called = false;
  const proxy = createMediaProxy({ environment, fetchImpl: async () => { called = true; } });

  for (const path of [['api', 'news'], ['personalities', '..', 'secret'], ['.env']]) {
    const response = createResponse();
    await proxy({ params: { path } }, response);
    assert.equal(response.statusCode, 404);
  }
  assert.equal(called, false);
});

test('media proxy reports an unreachable bucket as a gateway error', async () => {
  const proxy = createMediaProxy({ environment, fetchImpl: async () => { throw new Error('offline'); } });
  const response = createResponse();

  await proxy({ params: { path: ['parties', 'logos', 'pt.png'] } }, response);

  assert.equal(response.statusCode, 502);
});
