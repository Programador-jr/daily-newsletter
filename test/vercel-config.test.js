const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');

// As fontes de dados públicos são brasileiras e o impostometro.com.br recusa
// conexões vindas de iad1 (EUA); a função roda em São Paulo.
test('public data function runs in São Paulo, next to its Brazilian sources', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(config.functions?.['api/public-data.js']?.regions, ['gru1']);
});

// O servidor local e a Vercel precisam aplicar a mesma política de cache.
test('static cache headers in vercel.json match lib/static-cache rules', () => {
  const { STATIC_CACHE_RULES } = require('../lib/static-cache');
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const fromVercel = (config.headers || []).map(({ source, headers }) => ({
    source,
    cacheControl: headers.find(header => header.key === 'Cache-Control')?.value
  }));
  assert.deepEqual(
    fromVercel,
    STATIC_CACHE_RULES.map(({ source, cacheControl }) => ({ source, cacheControl }))
  );
});

test('static cache rules leave HTML pages revalidating and cache shared assets', () => {
  const { staticCacheControl } = require('../lib/static-cache');
  assert.equal(staticCacheControl('/index.html'), null);
  assert.equal(staticCacheControl('/historia.html'), null);
  assert.match(staticCacheControl('/css/styles.css'), /max-age=300, stale-while-revalidate/);
  assert.match(staticCacheControl('/navigation.html'), /max-age=300/);
  assert.match(staticCacheControl('/data/political-catalog.json'), /max-age=3600/);
  assert.match(staticCacheControl('/fonts/inter-latin-400.woff2'), /immutable/);
});
