const crypto = require('node:crypto');
const { connectDatabase } = require('./db');
const RateLimitCounter = require('./rate-limit-counter');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const MAX_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_LIMIT = 10000;

function positiveInteger(value, fallback, maximum) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum
    ? parsed
    : fallback;
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getClientIp(req) {
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim().slice(0, 128);

  // Vercel appends the connecting client address to this proxy header.
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    const addresses = forwarded.split(',').map(value => value.trim()).filter(Boolean);
    if (addresses.length) return addresses[addresses.length - 1].slice(0, 128);
  }

  const ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
  return String(ip).slice(0, 128);
}

function getWindowConfig(environment = process.env) {
  return {
    windowMs: positiveInteger(environment.RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS, MAX_WINDOW_MS),
    subscribeIpLimit: positiveInteger(environment.RATE_LIMIT_SUBSCRIBE_IP_MAX, 10, MAX_LIMIT),
    subscribeEmailLimit: positiveInteger(environment.RATE_LIMIT_SUBSCRIBE_EMAIL_MAX, 3, MAX_LIMIT),
    adminIpLimit: positiveInteger(environment.RATE_LIMIT_ADMIN_LOGIN_IP_MAX, 10, MAX_LIMIT),
    adminUserLimit: positiveInteger(environment.RATE_LIMIT_ADMIN_LOGIN_USER_MAX, 5, MAX_LIMIT)
  };
}

async function consumeRateLimit(scope, identifier, { limit, windowMs, now = Date.now() }) {
  if (!scope || typeof identifier !== 'string' || !identifier || !Number.isSafeInteger(limit) ||
      limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) {
    throw new TypeError('Configuração de rate limit inválida.');
  }

  await connectDatabase();

  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + (windowMs * 2));
  // Identifiers (including IP addresses and email addresses) are never stored in clear text.
  const key = hash(`${scope}:${identifier.toLowerCase()}`) + ':' + windowStart;
  let counter;

  try {
    counter = await RateLimitCounter.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Concurrent first requests can race while creating the same unique _id.
    if (error?.code !== 11000) throw error;
    counter = await RateLimitCounter.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 } },
      { new: true }
    );
  }

  const count = Number(counter?.count);
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new Error('O armazenamento de rate limit retornou um contador inválido.');
  }

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt: Math.ceil((windowStart + windowMs) / 1000),
    retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000))
  };
}

function setRateLimitHeaders(res, result) {
  res.setHeader('RateLimit-Limit', String(result.limit));
  res.setHeader('RateLimit-Remaining', String(result.remaining));
  res.setHeader('RateLimit-Reset', String(result.resetAt));
  if (!result.allowed) res.setHeader('Retry-After', String(result.retryAfterSeconds));
}

async function enforceRateLimits(req, res, checks, { now = Date.now() } = {}) {
  const ip = getClientIp(req);
  for (const check of checks) {
    const result = await consumeRateLimit(check.scope, check.identifier || ip, {
      limit: check.limit,
      windowMs: check.windowMs,
      now
    });
    setRateLimitHeaders(res, result);
    if (!result.allowed) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(429).json({
        error: 'Muitas tentativas. Aguarde antes de tentar novamente.',
        retryAfterSeconds: result.retryAfterSeconds
      });
      return false;
    }
  }
  return true;
}

module.exports = {
  consumeRateLimit,
  enforceRateLimits,
  getClientIp,
  getWindowConfig,
  setRateLimitHeaders
};
