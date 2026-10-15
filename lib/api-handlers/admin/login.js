const {
  createSessionToken,
  hasAdminConfiguration,
  sessionCookie,
  verifyCredentials
} = require('../../admin-auth');
const { enforceRateLimits, getClientIp, getWindowConfig } = require('../../rate-limiter');

module.exports = async function login(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const username = String(req.body?.username || '').trim().toLowerCase();
  const limits = getWindowConfig();
  const rateLimitChecks = [{
    scope: 'admin-login:ip',
    identifier: getClientIp(req),
    limit: limits.adminIpLimit,
    windowMs: limits.windowMs
  }];

  if (username) {
    rateLimitChecks.push({
      scope: 'admin-login:username',
      identifier: username,
      limit: limits.adminUserLimit,
      windowMs: limits.windowMs
    });
  }

  try {
    if (!await enforceRateLimits(req, res, rateLimitChecks)) return;
  } catch {
    return res.status(503).json({ error: 'A proteção contra tentativas excessivas está temporariamente indisponível.' });
  }

  if (!hasAdminConfiguration()) {
    return res.status(503).json({ error: 'Acesso administrativo ainda não configurado.' });
  }

  const password = String(req.body?.password || '');
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  res.setHeader('Set-Cookie', sessionCookie(createSessionToken()));
  return res.status(200).json({ authenticated: true });
};
