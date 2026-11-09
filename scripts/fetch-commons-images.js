require('dotenv').config();

// Busca retratos e logos livres no Wikimedia Commons (via Wikidata), converte
// para WebP, envia ao R2 e devolve os campos de crédito para o catálogo.
//
// Uso:
//   node scripts/fetch-commons-images.js <manifesto.json> [--upload] [--out=resultado.json]
//
// Manifesto: [{ "collection": "figures" | "parties", "id": "slug",
//               "wiki": "pt:Título" | "en:Título", "qid": "Q123" (opcional),
//               "official": { "url": "...", "credit": "...", "sourceUrl": "..." } (opcional) }]
//
// Só aceita licenças livres (domínio público, CC0, CC BY, CC BY-SA). Sem
// imagem livre, usa a foto oficial informada (ex.: Câmara/Senado, que
// autorizam reprodução com crédito). Sem nenhuma, o perfil fica sem imagem.

const fs = require('node:fs/promises');
const sharp = require('sharp');

const USER_AGENT = 'daily-newsletter-catalog/1.0 (https://github.com/Programador-jr/daily-newsletter)';
const FREE_LICENSE = /^(?:public domain|pd\b|cc0|cc[ -]by(?:[ -]sa)?(?:[ -][\d.]+)?)/i;
const PROPERTY_BY_COLLECTION = { figures: ['P18'], parties: ['P154', 'P18'] };
const R2_PREFIX = { figures: 'personalities/portraits', parties: 'parties/logos' };

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    if (response.ok) return response.json();
    if (response.status !== 429 && response.status < 500) throw new Error(`${response.status} ${url}`);
    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
  }
  throw new Error(`Falhou após novas tentativas: ${url}`);
}

const stripHtml = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const cleanArtist = value => {
  const text = stripHtml(value);
  return !text || /^unknown/i.test(text) ? 'Autor desconhecido' : text;
};

async function qidFor(entry) {
  if (entry.qid) return entry.qid;
  const [lang, ...rest] = entry.wiki.split(':');
  const title = rest.join(':');
  const data = await getJson(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageprops&redirects=1&format=json&titles=${encodeURIComponent(title)}`);
  const page = Object.values(data.query?.pages || {})[0];
  return page?.pageprops?.wikibase_item || null;
}

async function commonsFileFor(qid, properties) {
  const data = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=${qid}`);
  for (const property of properties) {
    const claims = (data.claims?.[property] || []).filter(claim => claim.mainsnak?.datavalue);
    // Prefere a declaração marcada como preferida.
    claims.sort((a, b) => (b.rank === 'preferred') - (a.rank === 'preferred'));
    if (claims.length) return claims[0].mainsnak.datavalue.value;
  }
  return null;
}

async function commonsInfo(fileName) {
  const data = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(`File:${fileName}`)}`);
  const info = Object.values(data.query?.pages || {})[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  return {
    downloadUrl: info.thumburl || info.url,
    pageUrl: info.descriptionurl,
    license: stripHtml(meta.LicenseShortName?.value),
    artist: cleanArtist(meta.Artist?.value)
  };
}

async function download(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ao baixar ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function resolveEntry(entry) {
  const qid = entry.wiki || entry.qid ? await qidFor(entry) : null;
  const file = qid ? await commonsFileFor(qid, PROPERTY_BY_COLLECTION[entry.collection]) : null;
  const info = file ? await commonsInfo(file) : null;
  if (info && FREE_LICENSE.test(info.license)) {
    return {
      buffer: await download(info.downloadUrl),
      credit: `${info.artist} / Wikimedia Commons (${info.license})`,
      sourceUrl: info.pageUrl,
      note: `Imagem livre do Wikimedia Commons, licença ${info.license}.`,
      qid
    };
  }
  if (entry.official?.url) {
    return {
      buffer: await download(entry.official.url),
      credit: entry.official.credit,
      sourceUrl: entry.official.sourceUrl || entry.official.url,
      note: entry.official.note || `Foto oficial: ${entry.official.credit}.`,
      qid
    };
  }
  return { skipped: info ? `licença não livre (${info.license})` : 'sem imagem no Wikidata', qid };
}

async function main() {
  const [manifestPath] = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  if (!manifestPath) throw new Error('Informe o manifesto JSON.');
  const upload = process.argv.includes('--upload');
  const outArg = process.argv.find(arg => arg.startsWith('--out='));
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const { uploadBufferToR2 } = upload ? require('../lib/r2') : {};
  const results = [];

  for (const entry of manifest) {
    try {
      const resolved = await resolveEntry(entry);
      if (resolved.skipped) {
        console.log(`- ${entry.id}: ${resolved.skipped}`);
        results.push({ id: entry.id, collection: entry.collection, skipped: resolved.skipped });
        continue;
      }
      const isLogo = entry.collection === 'parties';
      const webp = await sharp(resolved.buffer)
        .rotate()
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 6, alphaQuality: isLogo ? 100 : 80 })
        .toBuffer();
      const key = `${R2_PREFIX[entry.collection]}/${entry.id}.webp`;
      if (upload) await uploadBufferToR2(webp, key);
      const fields = isLogo
        ? { logoPath: `/${key}`, logoSourceName: resolved.credit, logoSourceUrl: resolved.sourceUrl, logoNote: resolved.note }
        : { imagePath: `/${key}`, imageCredit: resolved.credit, imageSourceUrl: resolved.sourceUrl, imageNote: resolved.note };
      console.log(`+ ${entry.id}: ${(webp.length / 1024).toFixed(0)} KB — ${resolved.credit}${upload ? ' (enviado)' : ''}`);
      results.push({ id: entry.id, collection: entry.collection, qid: resolved.qid, fields });
    } catch (error) {
      console.log(`! ${entry.id}: ${error.message}`);
      results.push({ id: entry.id, collection: entry.collection, error: error.message });
    }
    // Respeita o limite de requisições das APIs da Wikimedia.
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  if (outArg) await fs.writeFile(outArg.slice('--out='.length), `${JSON.stringify(results, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
