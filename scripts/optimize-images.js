require('dotenv').config();

// Reduz retratos e logos pesados do catálogo: redimensiona, converte para WebP
// com um nome novo (o R2 serve com cache imutável de 1 ano, então reaproveitar
// o nome antigo deixaria a versão pesada presa nos navegadores), troca as
// referências nos dados e, com --upload, envia os novos arquivos ao R2.
//
// Uso: node scripts/optimize-images.js [--min-kb=200] [--max-width=800] [--dry-run] [--upload]

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const SCOPES = ['personalities/portraits', 'parties/logos', 'presidents/portraits'];
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const REFERENCE_FILES = [
  'public/data/political-catalog.json',
  'public/data/political-catalog-audit.json',
  'public/js/data/atlas-personalidades.js',
  'public/js/data/atlas-partidos.js',
  'public/js/data/president-portraits.js'
];

function option(name, fallback) {
  const match = process.argv.find(arg => arg.startsWith(`--${name}=`));
  return match ? Number(match.split('=')[1]) : fallback;
}

async function main() {
  const minBytes = option('min-kb', 200) * 1024;
  const maxWidth = option('max-width', 800);
  const dryRun = process.argv.includes('--dry-run');
  const upload = process.argv.includes('--upload');
  const { uploadFileToR2 } = upload ? require('../lib/r2') : {};

  const renames = [];
  let before = 0;
  let after = 0;

  for (const scope of SCOPES) {
    const directory = path.join(PUBLIC, scope);
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const extension = path.extname(entry.name).toLowerCase();
      if (!entry.isFile() || !SOURCE_EXTENSIONS.has(extension)) continue;
      const sourcePath = path.join(directory, entry.name);
      const { size } = await fs.stat(sourcePath);
      if (size < minBytes) continue;

      const targetName = `${path.basename(entry.name, path.extname(entry.name))}.webp`;
      const targetPath = path.join(directory, targetName);
      if (await fs.stat(targetPath).then(() => true, () => false)) {
        console.warn(`Pulando ${entry.name}: ${targetName} já existe.`);
        continue;
      }

      const output = await sharp(sourcePath)
        .rotate()
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();

      before += size;
      after += output.length;
      renames.push({ from: `/${scope}/${entry.name}`, to: `/${scope}/${targetName}` });
      console.log(`${scope}/${entry.name}: ${(size / 1024).toFixed(0)} KB -> ${targetName} ${(output.length / 1024).toFixed(0)} KB`);
      if (dryRun) continue;

      await fs.writeFile(targetPath, output);
      if (upload) {
        const result = await uploadFileToR2(targetPath, `${scope}/${targetName}`);
        console.log(`  enviado ao R2: ${result.key}`);
      }
      await fs.unlink(sourcePath);
    }
  }

  if (!dryRun && renames.length) {
    for (const relative of REFERENCE_FILES) {
      const filePath = path.join(ROOT, relative);
      let content = await fs.readFile(filePath, 'utf8').catch(() => null);
      if (content === null) continue;
      let changed = 0;
      for (const { from, to } of renames) {
        // As referências aparecem com ou sem a barra inicial.
        for (const [oldRef, newRef] of [[from, to], [from.slice(1), to.slice(1)]]) {
          const parts = content.split(`"${oldRef}"`);
          changed += parts.length - 1;
          content = parts.join(`"${newRef}"`);
        }
      }
      if (changed) {
        await fs.writeFile(filePath, content);
        console.log(`${relative}: ${changed} referências atualizadas.`);
        if (relative.endsWith('political-catalog.json')) console.log('Rode npm run catalog:split para atualizar public/data/catalog/.');
      }
    }
  }

  console.log(`${renames.length} imagens: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB${dryRun ? ' (dry-run)' : ''}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
