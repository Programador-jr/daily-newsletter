const assert = require('node:assert/strict');
const { test } = require('node:test');
const readResponseLimited = require('../lib/read-response-limited');

function responseFromChunks(chunks, contentLength = null) {
  let index = 0;
  let cancelled = false;
  let reads = 0;
  return {
    get cancelled() { return cancelled; },
    get reads() { return reads; },
    headers: { get: name => name === 'content-length' ? contentLength : null },
    body: {
      getReader() {
        return {
          async read() {
            reads += 1;
            if (index >= chunks.length) return { done: true };
            return { done: false, value: Buffer.from(chunks[index++]) };
          },
          async cancel() { cancelled = true; },
          releaseLock() {}
        };
      }
    }
  };
}

test('reads a streamed response when its size is within the limit', async () => {
  const response = responseFromChunks(['hello', ' world']);
  const result = await readResponseLimited(response, 11, 'too large');
  assert.equal(result.toString('utf8'), 'hello world');
  assert.equal(response.cancelled, false);
});

test('rejects oversized chunked responses and cancels the stream immediately', async () => {
  const response = responseFromChunks(['1234', '5678', 'never-read']);
  await assert.rejects(readResponseLimited(response, 6, 'payload too large'), /payload too large/);
  assert.equal(response.cancelled, true);
  assert.equal(response.reads, 2);
});

test('rejects a declared oversized response before reading its body', async () => {
  const response = responseFromChunks(['never-read'], '999');
  await assert.rejects(readResponseLimited(response, 10, 'payload too large'), /payload too large/);
  assert.equal(response.reads, 0);
});

test('supports responses without a readable stream as a bounded fallback', async () => {
  const response = {
    headers: { get: () => null },
    arrayBuffer: async () => Uint8Array.from([65, 66, 67]).buffer
  };
  assert.equal((await readResponseLimited(response, 3, 'too large')).toString(), 'ABC');
  await assert.rejects(readResponseLimited(response, 2, 'too large'), /too large/);
});
