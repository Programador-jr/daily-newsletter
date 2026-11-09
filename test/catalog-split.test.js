const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { buildSplit, rebuild, SOURCE, OUTPUT_DIR } = require('../scripts/split-political-catalog');
const CatalogData = require('../public/js/catalog-data');

const generated = buildSplit(fs.readFileSync(SOURCE, 'utf8'));

// political-catalog.json é a fonte; as páginas leem só os arquivos divididos.
test('split catalog files are up to date with political-catalog.json', () => {
  for (const [name, content] of Object.entries(generated.files)) {
    const file = path.join(OUTPUT_DIR, name);
    assert.ok(fs.existsSync(file), `${name} não foi gerado`);
    assert.equal(
      fs.readFileSync(file, 'utf8'),
      content,
      `${name} está desatualizado: rode node scripts/split-political-catalog.js`
    );
  }
});

test('core, details and quiz files rebuild the original catalog exactly', () => {
  assert.deepStrictEqual(rebuild(generated.files), generated.source);
});

test('catalog pages get cards and search data from core plus their own section', () => {
  const core = CatalogData.hydrateCore(JSON.parse(generated.files['core.json']));
  const figure = core.profiles.figures[0];
  assert.ok(figure.nome && figure.name === figure.nome);
  assert.deepEqual(figure.axes, figure.vetor);
  assert.equal(figure.resumo, undefined, 'textos ficam fora do core');

  CatalogData.mergeDetails(core, JSON.parse(generated.files['details-personalidades.json']));
  const original = generated.source.profiles.figures[0];
  assert.equal(figure.resumo, original.resumo);
  assert.equal(figure.summary, original.summary);
  assert.equal(figure.longDescription, original.longDescription);
  assert.equal(core.profiles.parties[0].resumo, undefined, 'outras seções só carregam ao abrir uma ficha');
});

test('core is the small file every catalog page shares', () => {
  const sourceSize = fs.statSync(SOURCE).size;
  assert.ok(generated.files['core.json'].length < sourceSize / 2);
});
