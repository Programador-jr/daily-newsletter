'use strict';

const crypto = require('node:crypto');

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

// Compare Bearer tokens in constant time so response timing cannot reveal how
// many leading characters of a secret were guessed correctly.
function isBearerAuthorized(req, secret) {
  if (typeof secret !== 'string' || !secret) return false;
  const header = req.headers?.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  return crypto.timingSafeEqual(digest(match[1]), digest(secret));
}

module.exports = { isBearerAuthorized };
