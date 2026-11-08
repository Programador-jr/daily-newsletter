const crypto = require('node:crypto');
const dns = require('node:dns/promises');
const net = require('node:net');

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'],
  ['image/gif', 'gif'], ['image/avif', 'avif']
]);

const PRIVATE_IPV4_RANGES = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]
];

function ipv4ToInt(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIpv4(address) {
  const value = ipv4ToInt(address);
  if (value === null) return true;
  return PRIVATE_IPV4_RANGES.some(([base, bits]) => {
    const baseValue = ipv4ToInt(base);
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) === (baseValue & mask);
  });
}

// Node's URL parser can represent IPv4-mapped addresses as ::ffff:7f00:1
// instead of ::ffff:127.0.0.1. Normalize both forms before the range check.
function mappedIpv4FromIpv6(address) {
  const value = address.toLowerCase();
  const mapped = /^::ffff:(.+)$/.exec(value);
  const compatible = /^::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(value);
  const tail = mapped ? mapped[1] : compatible ? `${compatible[1]}:${compatible[2]}` : null;
  if (!tail) return null;
  if (net.isIP(tail) === 4) return tail;
  const hex = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(tail);
  if (!hex) return null;
  const high = parseInt(hex[1], 16);
  const low = parseInt(hex[2], 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

function isPrivateIpv6(address) {
  const value = address.toLowerCase();
  const mapped = mappedIpv4FromIpv6(value);
  if (mapped) return isPrivateIpv4(mapped);
  return value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') ||
    /^fe[89ab]/.test(value) || /^fe[c-f]/.test(value) || value.startsWith('ff') ||
    value.startsWith('2001:db8:') || value.startsWith('2002:') || value.startsWith('64:ff9b:');
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) return isPrivateIpv6(address);
  return true;
}

async function validatePublicHttpsUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('URL da imagem inválida.'); }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
    throw new Error('A imagem deve usar uma URL HTTPS pública.');
  }
  if (url.port && url.port !== '443') throw new Error('A imagem deve usar a porta HTTPS padrão.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || (net.isIP(host) && isPrivateAddress(host))) {
    throw new Error('O host da imagem não é permitido.');
  }
  if (!net.isIP(host)) {
    // Resolve once and reject any private answer. DNS answers can still change
    // between this check and the fetch (DNS rebinding); callers should treat the
    // publishing secret as the primary trust boundary for this endpoint.
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
  const cacheControl = 'public, max-age=31536000, immutable';
  const canonicalHeaders = 'cache-control:' + cacheControl + '\nhost:' + host + '\nx-amz-content-sha256:' + payloadHash + '\nx-amz-date:' + amzDate + '\n';
  const signedHeaders = 'cache-control;host;x-amz-content-sha256;x-amz-date';
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
    headers: { Authorization: authorization, 'x-amz-date': amzDate, 'x-amz-content-sha256': payloadHash, 'Content-Type': contentType, 'Cache-Control': cacheControl },
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

module.exports = { isPrivateAddress, uploadImageFromUrl, validatePublicHttpsUrl };
