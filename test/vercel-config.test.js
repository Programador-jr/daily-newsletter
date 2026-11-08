const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');

test('public data function runs in the external-data region', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(config.functions?.['api/public-data.js']?.regions, ['iad1']);
});
