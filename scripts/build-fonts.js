// Gera as fontes servidas pelo próprio site, no lugar do Google Fonts e do
// Font Awesome completo do cdnjs:
//   public/fonts/*.woff2  — Inter (variável), Playfair Display 700 e o
//                           Font Awesome reduzido aos ícones usados
//   public/css/fonts.css  — @font-face + classes dos ícones usados
//
// Rode de novo sempre que um ícone novo (fa-*) entrar no HTML/JS/JSON:
//   node scripts/build-fonts.js
// O nome dos arquivos do Font Awesome leva um hash do conteúdo, porque /fonts
// é servido com cache imutável de 1 ano.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const subsetFont = require('subset-font');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const FONTS_DIR = path.join(PUBLIC, 'fonts');
const OUTPUT_CSS = path.join(PUBLIC, 'css', 'fonts.css');
const FA = path.join(ROOT, 'node_modules', '@fortawesome', 'fontawesome-free');
const INTER = path.join(ROOT, 'node_modules', '@fontsource-variable', 'inter');
const PLAYFAIR = path.join(ROOT, 'node_modules', '@fontsource', 'playfair-display');
const TEXT_SUBSETS = ['latin', 'latin-ext'];

function walk(directory, extensions, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['fonts', 'personalities', 'parties', 'presidents'].includes(entry.name)) continue;
      walk(full, extensions, files);
    } else if (extensions.has(path.extname(entry.name)) && full !== OUTPUT_CSS) {
      files.push(full);
    }
  }
  return files;
}

function usedIconTokens() {
  const tokens = new Set();
  for (const file of walk(PUBLIC, new Set(['.html', '.js', '.json', '.css']))) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/\bfa-[a-z0-9-]+/g)) tokens.add(match[0]);
  }
  return tokens;
}

// Lê a unicode-range de cada subconjunto direto do CSS do fontsource.
function fontsourceFaces(cssFile, nameFilter) {
  const css = fs.readFileSync(cssFile, 'utf8');
  return [...css.matchAll(/\/\* ([^*]+) \*\/\s*@font-face\s*{([^}]+)}/g)]
    .filter(([, name]) => nameFilter(name.trim()))
    .map(([, name, body]) => ({
      name: name.trim(),
      file: body.match(/url\(\.\/files\/([^)]+\.woff2)\)/)[1],
      unicodeRange: body.match(/unicode-range:\s*([^;]+);/)[1].trim()
    }));
}

function copyFont(sourceDirectory, fileName) {
  fs.copyFileSync(path.join(sourceDirectory, 'files', fileName), path.join(FONTS_DIR, fileName));
  return `/fonts/${fileName}`;
}

function textFontFaces() {
  const inter = fontsourceFaces(path.join(INTER, 'wght.css'),
    name => TEXT_SUBSETS.some(subset => name === `inter-${subset}-wght-normal`));
  const playfair = fontsourceFaces(path.join(PLAYFAIR, '700.css'),
    name => TEXT_SUBSETS.some(subset => name === `playfair-display-${subset}-700-normal`));

  // O CSS do site usa "Inter" e "Playfair Display"; o arquivo variável da
  // Inter cobre os pesos 400–700 com um único download.
  const faces = [
    ...inter.map(face => ({ ...face, family: 'Inter', weight: '100 900', format: 'woff2-variations', url: copyFont(INTER, face.file) })),
    ...playfair.map(face => ({ ...face, family: 'Playfair Display', weight: '700', format: 'woff2', url: copyFont(PLAYFAIR, face.file) }))
  ];
  return faces.map(face => `@font-face {
  font-family: "${face.family}";
  font-style: normal;
  font-weight: ${face.weight};
  font-display: swap;
  src: url("${face.url}") format("${face.format}");
  unicode-range: ${face.unicodeRange};
}`).join('\n');
}

// Divide o fontawesome.css em regras de ícone (.fa-x::before { content }) e
// regras utilitárias (tamanhos, animações), mantendo só os ícones usados.
function iconCss(tokens) {
  const css = fs.readFileSync(path.join(FA, 'css', 'fontawesome.css'), 'utf8')
    .replace(/\/\*![\s\S]*?\*\//, '');
  const kept = [];
  const codepoints = new Set();
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf('{', index);
    if (open === -1) break;
    const selector = css.slice(index, open).trim();
    // Blocos aninhados (@media, @keyframes) são copiados inteiros.
    let depth = 1;
    let cursor = open + 1;
    while (depth > 0 && cursor < css.length) {
      if (css[cursor] === '{') depth += 1;
      else if (css[cursor] === '}') depth -= 1;
      cursor += 1;
    }
    const body = css.slice(open + 1, cursor - 1).trim();
    index = cursor;

    const iconSelectors = selector.split(',').map(part => part.trim());
    const isIconRule = iconSelectors.every(part => /^\.fa-[a-z0-9-]+::before$/.test(part))
      && /content:\s*"\\[0-9a-f]+"/i.test(body);
    if (!isIconRule) {
      kept.push(`${selector} {\n  ${body} }`);
      continue;
    }
    const used = iconSelectors.filter(part => tokens.has(part.slice(1, -'::before'.length)));
    if (!used.length) continue;
    codepoints.add(parseInt(body.match(/content:\s*"\\([0-9a-f]+)"/i)[1], 16));
    kept.push(`${used.join(',\n')} {\n  ${body} }`);
  }
  return { css: kept.join('\n\n'), codepoints };
}

async function subsetIconFont(fileName, codepoints) {
  const source = fs.readFileSync(path.join(FA, 'webfonts', fileName));
  const text = [...codepoints].map(codepoint => String.fromCodePoint(codepoint)).join('');
  const subset = await subsetFont(source, text, { targetFormat: 'woff2' });
  const hash = crypto.createHash('sha256').update(subset).digest('hex').slice(0, 10);
  const outputName = fileName.replace(/\.woff2$/, `.${hash}.woff2`);
  fs.writeFileSync(path.join(FONTS_DIR, outputName), subset);
  return { url: `/fonts/${outputName}`, size: subset.length };
}

async function main() {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  for (const old of fs.readdirSync(FONTS_DIR)) {
    if (/^fa-(solid|regular)-\d+\.[0-9a-f]+\.woff2$/.test(old)) fs.unlinkSync(path.join(FONTS_DIR, old));
  }

  const tokens = usedIconTokens();
  const icons = iconCss(tokens);
  const solid = await subsetIconFont('fa-solid-900.woff2', icons.codepoints);
  const regular = await subsetIconFont('fa-regular-400.woff2', icons.codepoints);

  fs.copyFileSync(path.join(FA, 'LICENSE.txt'), path.join(FONTS_DIR, 'LICENSE-font-awesome.txt'));
  fs.copyFileSync(path.join(INTER, 'LICENSE'), path.join(FONTS_DIR, 'LICENSE-inter.txt'));
  fs.copyFileSync(path.join(PLAYFAIR, 'LICENSE'), path.join(FONTS_DIR, 'LICENSE-playfair-display.txt'));

  const output = `/*
 * Gerado por scripts/build-fonts.js — não edite à mão.
 * Inter e Playfair Display: SIL Open Font License 1.1.
 * Font Awesome Free 6.4.0 (https://fontawesome.com/license/free) — Icons: CC BY 4.0,
 * Fonts: SIL OFL 1.1, Code: MIT. Reduzido aos ícones usados pelo site.
 */
${textFontFaces()}

:root, :host {
  --fa-style-family-classic: "Font Awesome 6 Free";
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free"; }

@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 900;
  font-display: block;
  src: url("${solid.url}") format("woff2"); }

@font-face {
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("${regular.url}") format("woff2"); }

.fas,
.fa-solid {
  font-weight: 900; }

.far,
.fa-regular {
  font-weight: 400; }

${icons.css}
`;
  fs.writeFileSync(OUTPUT_CSS, output);
  console.log(`${icons.codepoints.size} ícones; solid ${(solid.size / 1024).toFixed(1)} KB, regular ${(regular.size / 1024).toFixed(1)} KB; fonts.css ${(output.length / 1024).toFixed(1)} KB.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
