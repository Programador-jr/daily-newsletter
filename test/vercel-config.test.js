const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');

// As fontes de dados públicos são brasileiras e o impostometro.com.br recusa
// conexões vindas de iad1 (EUA); a função roda em São Paulo.
test('public data function runs in São Paulo, next to its Brazilian sources', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(config.functions?.['api/public-data.js']?.regions, ['gru1']);
});
