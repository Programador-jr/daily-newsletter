// Aplica no catálogo os campos de imagem gerados por fetch-commons-images.js.
//   node scripts/apply-image-results.js data/catalog-sources/image-gaps-results.json
// Depois rode npm run catalog:split.
const fs = require('node:fs');
const path = require('node:path');
const { stringifyCatalog } = require('./lib/catalog-json');

const CATALOG = path.join(__dirname, '..', 'public', 'data', 'political-catalog.json');
const [resultsFile] = process.argv.slice(2);
if (!resultsFile) throw new Error('Informe o arquivo de resultados.');

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
let applied = 0;
for (const result of JSON.parse(fs.readFileSync(resultsFile, 'utf8'))) {
  if (!result.fields) continue;
  const item = catalog.profiles[result.collection]?.find(entry => entry.id === result.id);
  if (!item) {
    console.log(`? ${result.id}: não está no catálogo`);
    continue;
  }
  Object.assign(item, result.fields);
  // A imagem nova tem licença verificada: remove a marcação antiga.
  delete item.imageLicenseUnverified;
  applied += 1;
}
fs.writeFileSync(CATALOG, stringifyCatalog(catalog));
console.log(`${applied} perfis atualizados.`);
