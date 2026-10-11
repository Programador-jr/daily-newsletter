const crypto = require('node:crypto');

const COOKIE_NAME = 'kings_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function hasAdminConfiguration(environment = process.env) {
  return Boolean(
    environment.ADMIN_USERNAME?.trim() &&
    environment.ADMIN_PASSWORD?.trim() &&
    environment.ADMIN_SESSION_SECRET?.trim() &&
    environment.ADMIN_SESSION_SECRET.trim().length >= 32
  );
}

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function secureCompare(actual, expected) {
  return crypto.timingSafeEqual(digest(actual), digest(expected));
}

function verifyCredentials(username, password, environment = process.env) {
  if (!hasAdminConfiguration(environment)) return false;
  return secureCompare(username, environment.ADMIN_USERNAME) &&
    secureCompare(password, environment.ADMIN_PASSWORD);
}

function signSession(expiresAt, secret) {
  return crypto.createHmac('sha256', secret).update(`admin:${expiresAt}`).digest('base64url');
}

function createSessionToken(environment = process.env, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${expiresAt}.${signSession(expiresAt, environment.ADMIN_SESSION_SECRET)}`;
}

function getCookie(req, name = COOKIE_NAME) {
  const header = req.headers?.cookie || '';
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return '';
    }
  }
  return '';
}

function isSessionValid(req, environment = process.env, now = Date.now()) {
  if (!hasAdminConfiguration(environment)) return false;
  const token = getCookie(req);
  const [expiryText, signature, ...extra] = token.split('.');
  if (!expiryText || !signature || extra.length) return false;
  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  return secureCompare(signature, signSession(expiresAt, environment.ADMIN_SESSION_SECRET));
}

function sessionCookie(token, { clear = false, production = process.env.NODE_ENV === 'production' } = {}) {
  const attributes = [
    `${COOKIE_NAME}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/api/admin',
    'HttpOnly',
    'SameSite=Strict'
  ];
  if (production) attributes.push('Secure');
  if (clear) attributes.push('Max-Age=0');
  else attributes.push(`Max-Age=${SESSION_TTL_SECONDS}`);
  return attributes.join('; ');
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  hasAdminConfiguration,
  isSessionValid,
  sessionCookie,
  verifyCredentials
};
