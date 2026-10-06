const assert = require('node:assert/strict');
const test = require('node:test');
const { createToken, hashToken } = require('../lib/tokens');

test('createToken returns a cryptographically strong 64-character hex token', () => {
  const token = createToken();

  assert.match(token, /^[a-f0-9]{64}$/);
});

test('createToken returns a different token on each call', () => {
  assert.notEqual(createToken(), createToken());
});

test('hashToken returns a deterministic SHA-256 hex digest', () => {
  assert.equal(
    hashToken('newsletter-token'),
    'acc6d2783bcf0f9be680212f490cb34f1c3c26e7d68cc4f89566fdad6800a8b4'
  );
});
