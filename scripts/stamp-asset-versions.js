'use strict';

// Carimba as referências a /css/*.css e /js/*.js com ?v=<hash do conteúdo>:
// nos <link>/<script> das páginas e nos caminhos literais dentro dos próprios JS
// (ex.: vercel-observability.js injeta page-loader.css e page-loader.js).
//
// Por quê: o Cloudflare na frente da Vercel reescreve o Cache-Control de CSS e
// JS para max-age=14400. Sem uma URL nova, quem já visitou o site recebe o HTML
// novo com CSS/JS antigos por até 4 horas. O hash só muda quando o arquivo muda,
// então o cache dos arquivos intactos continua valendo.
//
// Uso: node scripts/stamp-asset-versions.js          (reescreve os arquivos)
//      node scripts/stamp-asset-versions.js --check  (só confere; sai com 1 se houver diferença)

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ASSET_DIRS = ['css', 'js'];

// <link href="/css/a.css"> e <script src="/js/a.js"> (também "js/a.js" relativo).
// Inclui subpastas, como /js/data/atlas-paises.js.
const HTML_REF = /((?:href|src)=")(\/?)(css|js)\/((?:[\w-]+\/)*[\w.-]+\.(?:css|js))(?:\?v=[^"]*)?(")/g;
// "/css/a.css" ou '/js/a.js' como string literal dentro de um JS.
const JS_REF = /(["'])\/(css|js)\/((?:[\w-]+\/)*[\w.-]+\.(?:css|js))(?:\?v=[^"']*)?\1/g;

function hashText(text) {
  // Normaliza fins de linha para o hash ser igual no Windows (CRLF) e no CI (LF).
  return crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, 10);
}

function listFiles(dir, ext, { recursive = false } = {}) {
  return fs.readdirSync(dir, { recursive })
    .filter((name) => name.endsWith(ext))
    .map((name) => path.join(dir, name));
}

// Lê CSS e JS e resolve as versões. Um JS que cita outro arquivo muda de conteúdo
// ao ser carimbado, então repete até nenhuma versão mudar.
function resolveAssets() {
  const assets = new Map(); // "css/a.css" -> { file, original, text, version }
  for (const dir of ASSET_DIRS) {
    for (const file of listFiles(path.join(PUBLIC_DIR, dir), `.${dir}`, { recursive: true })) {
      const original = fs.readFileSync(file, 'utf8');
      const key = path.relative(PUBLIC_DIR, file).split(path.sep).join('/');
      assets.set(key, { file, original, text: original, version: hashText(original) });
    }
  }

  const versionOf = (key) => {
    const asset = assets.get(key);
    if (!asset) throw new Error(`Arquivo referenciado não existe: /${key}`);
    return asset.version;
  };

  for (let pass = 0; ; pass += 1) {
    if (pass > 20) throw new Error('Referências circulares entre JS impedem fixar as versões');
    let changed = false;
    for (const asset of assets.values()) {
      if (!asset.file.endsWith('.js')) continue;
      const text = asset.original.replace(JS_REF, (_, quote, dir, name) =>
        `${quote}/${dir}/${name}?v=${versionOf(`${dir}/${name}`)}${quote}`);
      if (text !== asset.text) {
        asset.text = text;
        asset.version = hashText(text);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return { assets, versionOf };
}

function stampHtml(html, versionOf) {
  return html.replace(HTML_REF, (_, open, slash, dir, name, close) =>
    `${open}${slash}${dir}/${name}?v=${versionOf(`${dir}/${name}`)}${close}`);
}

// Devolve os arquivos (JS e páginas) cujo conteúdo carimbado difere do disco.
function staleFiles() {
  const { assets, versionOf } = resolveAssets();
  const stale = [];
  for (const { file, original, text } of assets.values()) {
    if (text !== original) stale.push({ file, stamped: text });
  }
  for (const file of listFiles(PUBLIC_DIR, '.html')) {
    const current = fs.readFileSync(file, 'utf8');
    const stamped = stampHtml(current, versionOf);
    if (stamped !== current) stale.push({ file, stamped });
  }
  return stale;
}

function main() {
  const stale = staleFiles();
  const names = stale.map(({ file }) => path.relative(process.cwd(), file));
  if (process.argv.includes('--check')) {
    if (stale.length) {
      console.error(`Versões de CSS/JS desatualizadas em:\n  ${names.join('\n  ')}\nRode: npm run assets:stamp`);
      process.exit(1);
    }
    console.log('Versões de CSS/JS em dia.');
    return;
  }
  for (const { file, stamped } of stale) fs.writeFileSync(file, stamped);
  console.log(stale.length ? `Atualizado (${stale.length}): ${names.join(', ')}` : 'Versões de CSS/JS já estavam em dia.');
}

if (require.main === module) main();

module.exports = { staleFiles, stampHtml, resolveAssets };
