// Divide public/data/political-catalog.json (a fonte, editada à mão) nos
// arquivos que as páginas realmente baixam — veja public/js/catalog-data.js.
//
//   node scripts/split-political-catalog.js           gera public/data/catalog/
//   node scripts/split-political-catalog.js --check   falha se estiver desatualizado
//
// Rode sempre que political-catalog.json mudar. test/catalog-split.test.js
// confere que os arquivos gerados estão em dia e reconstroem a base exata.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const CatalogData = require('../public/js/catalog-data');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'public', 'data', 'political-catalog.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'data', 'catalog');

// Textos de cada seção. A página do catálogo baixa os da própria seção junto
// com o core (o resumo aparece nos cards e na busca); os das outras seções só
// quando uma ficha delas é aberta. Os perfis relacionados dentro da ficha
// usam apenas o core (nome, vetor, imagem).
const DETAIL_FIELDS = [
  'resumo',
  'description',
  'longDescription',
  'source',
  'phrase',
  'caracteristicas',
  'imageSourceUrl',
  'logoSourceUrl',
  'logoSourceName',
  'vectorNote'
];
const QUIZ_KEYS = ['questions', 'bookRecommendations'];

// Campos que repetem outro campo do mesmo perfil. A ordem importa: description
// é recriada antes de longDescription, que costuma ser cópia dela. A regra é
// aplicada no arquivo onde o campo de origem está (core ou details).
const ALIAS_CANDIDATES = [
  { field: 'summary', from: 'resumo' },
  { field: 'name', from: 'nome' },
  { field: 'axes', from: 'vetor' },
  { field: 'description', from: 'resumo' },
  { field: 'longDescription', from: 'description' }
].map(rule => ({ ...rule, stage: DETAIL_FIELDS.includes(rule.from) ? 'details' : 'core' }));

const same = (a, b) => {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch {
    return false;
  }
};

function buildSplit(sourceText) {
  const source = JSON.parse(sourceText);
  const version = crypto.createHash('sha256').update(sourceText).digest('hex').slice(0, 12);
  const collections = Object.keys(source.profiles);

  // Uma regra só vale para coleções em que todo perfil tem o campo; assim a
  // ausência no arquivo gerado sempre significa "igual à origem".
  const aliases = ALIAS_CANDIDATES.map(rule => ({
    ...rule,
    collections: collections.filter(collection =>
      source.profiles[collection].every(item => rule.field in item && rule.from in item))
  })).filter(rule => rule.collections.length);

  const core = {};
  for (const [key, value] of Object.entries(source)) {
    if (key !== 'profiles' && !QUIZ_KEYS.includes(key)) core[key] = value;
  }
  core.profiles = {};
  core._format = {
    version,
    aliases,
    detailGroups: CatalogData.DETAIL_GROUPS
  };

  const details = Object.fromEntries(Object.keys(CatalogData.DETAIL_GROUPS).map(group => [group, {}]));

  for (const collection of collections) {
    const group = CatalogData.GROUP_BY_COLLECTION[collection];
    if (!group) throw new Error(`Coleção sem grupo de fichas: ${collection}`);
    const rules = aliases.filter(rule => rule.collections.includes(collection));
    const detailById = {};

    core.profiles[collection] = source.profiles[collection].map(item => {
      const light = {};
      const heavy = {};
      for (const [key, value] of Object.entries(item)) {
        const rule = rules.find(candidate => candidate.field === key);
        if (rule && same(value, item[rule.from])) continue;
        if (DETAIL_FIELDS.includes(key)) heavy[key] = value;
        else light[key] = value;
      }
      if (Object.keys(heavy).length) detailById[item.id] = heavy;
      return light;
    });
    details[group][collection] = detailById;
  }

  const quiz = Object.fromEntries(QUIZ_KEYS.filter(key => key in source).map(key => [key, source[key]]));

  const files = { 'core.json': core, 'quiz.json': quiz };
  for (const [group, value] of Object.entries(details)) files[`details-${group}.json`] = value;
  return {
    source,
    files: Object.fromEntries(Object.entries(files).map(([name, value]) => [name, JSON.stringify(value)]))
  };
}

// Reconstrói a base a partir dos arquivos gerados, como o navegador faz.
function rebuild(files) {
  const core = CatalogData.hydrateCore(JSON.parse(files['core.json']));
  for (const group of Object.keys(CatalogData.DETAIL_GROUPS)) {
    CatalogData.mergeDetails(core, JSON.parse(files[`details-${group}.json`]));
  }
  return CatalogData.mergeQuiz(core, JSON.parse(files['quiz.json']));
}

function main() {
  const check = process.argv.includes('--check');
  const { source, files } = buildSplit(fs.readFileSync(SOURCE, 'utf8'));
  assert.deepStrictEqual(rebuild(files), source, 'Os arquivos divididos não reconstroem a base original.');

  if (check) {
    const stale = Object.entries(files).filter(([name, content]) => {
      const file = path.join(OUTPUT_DIR, name);
      return !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content;
    });
    if (stale.length) {
      console.error(`Catálogo dividido desatualizado: ${stale.map(([name]) => name).join(', ')}. Rode node scripts/split-political-catalog.js.`);
      process.exitCode = 1;
    }
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const zlib = require('node:zlib');
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUTPUT_DIR, name), content);
    const compressed = zlib.brotliCompressSync(Buffer.from(content)).length;
    console.log(`${name}: ${(content.length / 1024).toFixed(0)} KB (${(compressed / 1024).toFixed(0)} KB brotli)`);
  }
}

if (require.main === module) main();

module.exports = { buildSplit, rebuild, SOURCE, OUTPUT_DIR };
