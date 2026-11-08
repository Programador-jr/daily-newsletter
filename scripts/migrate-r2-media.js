require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { uploadFileToR2 } = require('../lib/r2');

const ROOT = path.join(__dirname, '..');
const SCOPES = {
  countries: {
    localDirectory: path.join(ROOT, 'public', 'countries', 'flags'),
    objectPrefix: 'countries/flags'
  },
  personalities: {
    localDirectory: path.join(ROOT, 'public', 'personalities', 'portraits'),
    objectPrefix: 'personalities/portraits'
  },
  parties: {
    localDirectory: path.join(ROOT, 'public', 'parties', 'logos'),
    objectPrefix: 'parties/logos'
  },
  presidents: {
    localDirectory: path.join(ROOT, 'public', 'presidents', 'portraits'),
    objectPrefix: 'presidents/portraits'
  }
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath));
      continue;
    }
    if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }
  return files.sort((first, second) => first.localeCompare(second));
}

async function main() {
  const [scopeName = 'countries', ...flags] = process.argv.slice(2);
  const scopeNames = scopeName === 'catalogs'
    ? ['personalities', 'parties', 'presidents']
    : scopeName === 'all'
      ? Object.keys(SCOPES)
      : [scopeName];
  const scopes = scopeNames.map((name) => {
    const scope = SCOPES[name];
    if (!scope) throw new Error(`Escopo desconhecido: ${name}`);
    return { name, ...scope };
  });

  const files = (await Promise.all(scopes.map(async (scope) => {
    const scopeFiles = await collectFiles(scope.localDirectory);
    return scopeFiles.map((filePath) => ({ filePath, scope }));
  }))).flat();
  const dryRun = flags.includes('--dry-run');
  console.log(`${files.length} imagens encontradas nos escopos: ${scopeNames.join(', ')}.`);

  if (dryRun) {
    console.log('Dry-run: nenhum arquivo foi enviado.');
    return;
  }

  let uploaded = 0;
  for (const { filePath, scope } of files) {
    const relativePath = path.relative(scope.localDirectory, filePath).split(path.sep).join('/');
    const key = `${scope.objectPrefix}/${relativePath}`;
    const result = await uploadFileToR2(filePath, key);
    uploaded += 1;
    console.log(`[${uploaded}/${files.length}] ${result.key} (${result.size} bytes)`);
  }

  console.log(`Migração concluída: ${uploaded} objetos enviados para o R2.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
