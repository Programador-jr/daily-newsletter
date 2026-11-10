const crypto = require('node:crypto');
const { isSessionValid } = require('../../admin-auth');
const { connectAdminDatabase } = require('../../admin-db');
const { getEmailBanner, setEmailBanner, resetEmailBanner } = require('../../newsletter-settings');
const { uploadBufferToR2, validatePublicHttpsUrl } = require('../../r2');

const MAX_BANNER_BYTES = 2 * 1024 * 1024;

// Email clients render these reliably; SVG is left out on purpose.
function detectImageType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { contentType: 'image/png', extension: 'png' };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { contentType: 'image/jpeg', extension: 'jpg' };
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return { contentType: 'image/gif', extension: 'gif' };
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return { contentType: 'image/webp', extension: 'webp' };
  return null;
}

function cleanAlt(value) {
  const alt = String(value ?? '').trim();
  return alt.length > 200 ? null : alt;
}

function errorCode(error, fallback) {
  return /^[A-Z0-9_]+$/.test(error?.code || '') ? error.code : fallback;
}

async function saveLink(body) {
  const alt = cleanAlt(body.alt);
  if (alt === null) return { status: 400, error: 'O texto alternativo deve ter no máximo 200 caracteres.' };
  let url;
  try {
    url = (await validatePublicHttpsUrl(String(body.url || '').trim())).href;
  } catch {
    return { status: 400, error: 'Informe um link https público para a imagem do banner.' };
  }
  if (url.length > 2048) return { status: 400, error: 'O link da imagem é longo demais.' };
  return { status: 200, banner: await setEmailBanner({ url, alt, source: 'link' }) };
}

async function saveUpload(body) {
  const alt = cleanAlt(body.alt);
  if (alt === null) return { status: 400, error: 'O texto alternativo deve ter no máximo 200 caracteres.' };
  const data = String(body.dataBase64 || '').replace(/^data:[^,]*,/, '');
  if (!data || !/^[A-Za-z0-9+/=\s]+$/.test(data)) return { status: 400, error: 'Envie um arquivo de imagem.' };
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length) return { status: 400, error: 'O arquivo enviado está vazio.' };
  if (buffer.length > MAX_BANNER_BYTES) return { status: 413, error: 'A imagem do banner deve ter no máximo 2 MB.' };
  const type = detectImageType(buffer);
  if (!type) return { status: 415, error: 'Use uma imagem PNG, JPG, GIF ou WebP.' };

  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
  const uploaded = await uploadBufferToR2(buffer, `email/banner-${hash}.${type.extension}`, type.contentType);
  return { status: 200, banner: await setEmailBanner({ url: uploaded.url, alt, source: 'upload' }) };
}

module.exports = async function adminEmailBanner(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Configure MONGODB_URI para gerenciar o banner.' });

  try {
    await connectAdminDatabase();
    if (req.method === 'GET') return res.status(200).json({ banner: await getEmailBanner() });
    if (req.method === 'DELETE') return res.status(200).json({ banner: await resetEmailBanner() });

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    let result;
    if (body.source === 'link') result = await saveLink(body);
    else if (body.source === 'upload') result = await saveUpload(body);
    else return res.status(400).json({ error: 'Escolha entre enviar um arquivo ou informar um link.' });

    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ banner: result.banner });
  } catch (error) {
    if (error?.code === 'R2_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'O armazenamento de imagens (R2) não está configurado. Use um link de imagem.' });
    }
    console.error(JSON.stringify({ event: 'admin.email_banner.failed', code: errorCode(error, 'EMAIL_BANNER_FAILED') }));
    return res.status(500).json({ error: 'Não foi possível salvar o banner.' });
  }
};

module.exports.detectImageType = detectImageType;
