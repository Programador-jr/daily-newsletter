const crypto = require('node:crypto');

const MIN_SECRET_LENGTH = 32;

function hasWorkerControlSecret(environment = process.env) {
  return typeof environment.WORKER_CONTROL_SECRET === 'string' &&
    environment.WORKER_CONTROL_SECRET.length >= MIN_SECRET_LENGTH;
}

function secureCompare(actual, expected) {
  const actualDigest = crypto.createHash('sha256').update(String(actual)).digest();
  const expectedDigest = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(actualDigest, expectedDigest);
}

function isWorkerAuthenticated(req, environment = process.env) {
  if (!hasWorkerControlSecret(environment)) return false;
  const authorization = req.headers?.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return Boolean(match && secureCompare(match[1], environment.WORKER_CONTROL_SECRET));
}

module.exports = { hasWorkerControlSecret, isWorkerAuthenticated, MIN_SECRET_LENGTH };
