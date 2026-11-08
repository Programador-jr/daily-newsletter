require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { uploadImageFromUrl } = require('../lib/r2');

const ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'public', 'fascismo-nazismo.html');
const SCRIPT_PATH = path.join(ROOT, 'public', 'js', 'fascismo-nazismo.js');
const FILE_EXTENSION = /\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const SPECIAL_FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const MAX_EXTERNAL_IMAGE_BYTES = 32 * 1024 * 1024;

function normalizeFileName(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return decoded.replaceAll('_', ' ').trim();
}

function addFile(files, value, sourceUrl) {
  const fileName = normalizeFileName(value);
  if (FILE_EXTENSION.test(fileName)) files.set(fileName, { fileName, sourceUrl: sourceUrl || sourceUrlFor(fileName) });
}

function sourceUrlFor(fileName) {
  return SPECIAL_FILE_PATH + encodeURIComponent(fileName);
}

function publicUrlFor(fileName) {
  const base = String(process.env.R2_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (!base) throw new Error('R2_PUBLIC_BASE_URL não está configurada.');
  return `${base}/external/wikimedia/${encodeURIComponent(fileName)}`;
}

async function collectFiles() {
  const [html, script] = await Promise.all([
    fs.readFile(HTML_PATH, 'utf8'),
    fs.readFile(SCRIPT_PATH, 'utf8')
  ]);
  const files = new Map();
  const htmlPattern = /https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^"'\s>]+)/g;
  for (const match of html.matchAll(htmlPattern)) addFile(files, match[1], SPECIAL_FILE_PATH + match[1]);
  const scriptPattern = /(["'])([^"'\r\n]+\.(?:jpg|jpeg|png|webp|gif|avif))\1/gi;
  for (const match of script.matchAll(scriptPattern)) addFile(files, match[2]);
  return [...files.values()].sort((first, second) => first.fileName.localeCompare(second.fileName));
}

async function rewriteStaticHtml(html, files) {
  const fileSet = new Set(files.map(file => file.fileName));
  return html.replace(/https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^"'\s>]+)/g, (full, encodedFileName) => {
    const fileName = normalizeFileName(encodedFileName);
    return fileSet.has(fileName) ? publicUrlFor(fileName) : full;
  });
}

async function uploadWithRetry(file) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await uploadImageFromUrl(file.sourceUrl, {
        key: `external/wikimedia/${file.fileName}`,
        maxBytes: MAX_EXTERNAL_IMAGE_BYTES
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 5000));
    }
  }
  try {
    return await uploadImageFromUrl(file.sourceUrl + '?width=800', {
      key: `external/wikimedia/${file.fileName}`,
      maxBytes: MAX_EXTERNAL_IMAGE_BYTES
    });
  } catch {
    // Fall through to the API lookup when the resized redirect is unavailable.
  }
  const apiUrl = new URL('https://commons.wikimedia.org/w/api.php');
  apiUrl.search = new URLSearchParams({
    action: 'query',
    titles: `File:${file.fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '1600',
    format: 'json',
    origin: '*'
  });
  const apiResponse = await fetch(apiUrl, {
    headers: { 'User-Agent': 'daily-newsletter-r2-migrator/1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  if (apiResponse.ok) {
    const data = await apiResponse.json();
    const imageInfo = Object.values(data.query?.pages || {})[0]?.imageinfo?.[0];
    if (imageInfo?.thumburl) {
      let thumbnailUrl = imageInfo.thumburl;
      const parsedThumbnail = new URL(thumbnailUrl);
      const pathMatch = parsedThumbnail.pathname.match(/^\/wikipedia\/commons\/([^/]+)\/([^/]+)\/(.+)$/);
      if (pathMatch && parsedThumbnail.hostname === 'upload.wikimedia.org') {
        const width = imageInfo.thumbwidth || 960;
        const [hashDirectory, hashBucket, encodedFileName] = pathMatch.slice(1);
        thumbnailUrl = `https://thumb.wikimedia.org/wikipedia/commons/thumb/${hashDirectory}/${hashBucket}/${encodedFileName}/${width}px-${encodedFileName}`;
      }
      return uploadImageFromUrl(thumbnailUrl, {
        key: `external/wikimedia/${file.fileName}`,
        maxBytes: MAX_EXTERNAL_IMAGE_BYTES
      });
    }
  }
  throw new Error(`${file.fileName}: ${lastError.message}`);
}

async function objectExists(fileName) {
  const response = await fetch(publicUrlFor(fileName), { method: 'HEAD' });
  return response.ok;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = await collectFiles();
  console.log(`${files.length} imagens externas do Wikimedia encontradas.`);
  if (dryRun) {
    console.log('Dry-run: nenhum arquivo foi baixado ou enviado.');
    return;
  }

  const completedFiles = [];
  const failures = [];
  for (const [index, file] of files.entries()) {
    if (await objectExists(file.fileName)) {
      console.log(`[${index + 1}/${files.length}] ${file.fileName} (já estava no R2)`);
      completedFiles.push(file);
      continue;
    }
    try {
      const result = await uploadWithRetry(file);
      completedFiles.push(file);
      console.log(`[${index + 1}/${files.length}] ${result.key} (${result.size} bytes)`);
    } catch (error) {
      failures.push({ file, error });
      console.error(`[${index + 1}/${files.length}] ${error.message}`);
    }
  }

  const html = await fs.readFile(HTML_PATH, 'utf8');
  const rewrittenHtml = await rewriteStaticHtml(html, completedFiles);
  await fs.writeFile(HTML_PATH, rewrittenHtml, 'utf8');
  console.log(`Migração concluída: ${completedFiles.length} imagens disponíveis no R2 e HTML atualizado.`);
  if (failures.length) {
    console.error(`${failures.length} imagens não puderam ser migradas nesta tentativa.`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
