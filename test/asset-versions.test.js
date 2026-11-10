const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const { staleFiles, stampHtml, resolveAssets } = require('../scripts/stamp-asset-versions');

// O Cloudflare guarda CSS e JS no navegador por 4 horas; sem ?v= novo a cada
// mudança, quem já visitou o site vê o HTML novo com CSS/JS antigos.
test('pages and scripts reference CSS/JS with the current content version', () => {
  const stale = staleFiles().map(({ file }) => path.relative(path.join(__dirname, '..'), file));
  assert.deepEqual(stale, [], `rode npm run assets:stamp (desatualizados: ${stale.join(', ')})`);
});

test('stamping replaces old versions and leaves other links alone', () => {
  const { versionOf } = resolveAssets();
  const html = [
    '<link rel="stylesheet" href="/css/styles.css?v=old">',
    '<script src="js/footer.js"></script>',
    '<link rel="icon" href="/assets/icons/favicon.ico?v=1">'
  ].join('');
  assert.equal(stampHtml(html, versionOf), [
    `<link rel="stylesheet" href="/css/styles.css?v=${versionOf('css/styles.css')}">`,
    `<script src="js/footer.js?v=${versionOf('js/footer.js')}"></script>`,
    '<link rel="icon" href="/assets/icons/favicon.ico?v=1">'
  ].join(''));
});

test('a script version changes when a file it loads changes', () => {
  const { assets } = resolveAssets();
  const observability = assets.get('js/vercel-observability.js').text;
  const loader = assets.get('css/page-loader.css').version;
  assert.match(observability, new RegExp(`/css/page-loader\\.css\\?v=${loader}`));
});

test('a reference to a missing file fails loudly', () => {
  const { versionOf } = resolveAssets();
  assert.throws(() => stampHtml('<link href="/css/nao-existe.css">', versionOf), /não existe/);
});
