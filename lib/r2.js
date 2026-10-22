const crypto = require('node:crypto');
const dns = require('node:dns/promises');
const net = require('node:net');

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'],
  ['image/gif', 'gif'], ['image/avif', 'avif']
]);

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const p = address.split('.').map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127 ||
      (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || p[0] >= 224;
  }
  if (family === 6) {
    const v = address.toLowerCase();
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') ||
      v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb') ||
      v.startsWith('::ffff:127.') || v.startsWith('::ffff:10.') || v.startsWith('::ffff:192.168.');
  }
  return true;
}

async function validatePublicHttpsUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('URL da imagem inválida.'); }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
    throw new Error('A imagem deve usar uma URL HTTPS pública.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || (net.isIP(host) && isPrivateAddress(host))) {
    throw new Error('O host da imagem não é permitido.');
  }
  if (!net.isIP(host)) {
    const addresses = await dns.lookup(host, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) throw new Error('O host da imagem não é permitido.');
  }
  return url;
}

function hmac(key, value, encoding) { return crypto.createHmac('sha256', key).update(value).digest(encoding); }

async function signAndUpload(buffer, contentType, key) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || 'kings-newsletter-images';
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw Object.assign(new Error('As credenciais do Cloudflare R2 não estão configuradas.'), { code: 'R2_NOT_CONFIGURED' });
  }
  const host = accountId + '.r2.cloudflarestorage.com';
  const canonicalUri = '/' + encodeURIComponent(bucket) + '/' + key.split('/').map(encodeURIComponent).join('/');
  const endpoint = 'https://' + host + canonicalUri;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const canonicalHeaders = 'host:' + host + '\nx-amz-content-sha256:' + payloadHash + '\nx-amz-date:' + amzDate + '\n';
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = dateStamp + '/auto/s3/aws4_request';
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, crypto.createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
  const dateKey = hmac('AWS4' + secretAccessKey, dateStamp);
  const regionKey = hmac(dateKey, 'auto');
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');
  const authorization = 'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + scope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { Authorization: authorization, 'x-amz-date': amzDate, 'x-amz-content-sha256': payloadHash, 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    body: buffer
  });
  if (!response.ok) throw Object.assign(new Error('Falha no upload para o R2 (HTTP ' + response.status + ').'), { code: 'R2_UPLOAD_FAILED' });
  return publicBaseUrl.replace(/\/+$/, '') + '/' + key.split('/').map(encodeURIComponent).join('/');
}

async function uploadImageFromUrl(sourceUrl) {
  if (!sourceUrl) return null;
  let currentUrl = sourceUrl;
  let response;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const url = await validatePublicHttpsUrl(currentUrl);
    response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects === 3) throw new Error('A imagem excedeu o limite de redirecionamentos.');
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirecionamento de imagem inválido.');
      currentUrl = new URL(location, url).href;
      continue;
    }
    break;
  }
  if (!response || !response.ok) throw new Error('Não foi possível obter a imagem da fonte.');
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) throw new Error('Formato de imagem não permitido.');
  if (Number(response.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) throw new Error('A imagem excede o limite de 8 MB.');
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of response.body) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_IMAGE_BYTES) { await response.body.cancel().catch(() => {}); throw new Error('A imagem excede o limite de 8 MB.'); }
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  if (!buffer.length) throw new Error('A imagem recebida está vazia.');
  const digest = crypto.createHash('sha256').update(buffer).digest('hex');
  const publicUrl = await signAndUpload(buffer, contentType, 'news/' + digest + '.' + extension);
  return { url: publicUrl, sourceUrl: sourceUrl, contentType: contentType, size: buffer.length };
}

module.exports = { uploadImageFromUrl };
