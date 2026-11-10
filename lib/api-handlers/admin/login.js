const {
  createSessionToken,
  hasAdminConfiguration,
  adminConfigurationCode,
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
  const username = String(req.body?.username || '');
  const normalizedUsername = username.trim().toLowerCase();
  const limits = getWindowConfig();
  const rateLimitChecks = [{
    scope: 'admin-login:ip',
    identifier: getClientIp(req),
    limit: limits.adminIpLimit,
    windowMs: limits.windowMs
  }];

  if (normalizedUsername) {
    rateLimitChecks.push({
      scope: 'admin-login:username',
      identifier: normalizedUsername,
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
    // The reason (e.g. which password rule fails) is for the operator's logs
    // only: telling an anonymous caller would describe the real password.
    console.error(JSON.stringify({ event: 'admin.login.unavailable', reason: adminConfigurationCode() }));
    return res.status(503).json({ error: 'Acesso administrativo indisponível no momento.' });
  }

  const password = String(req.body?.password || '');
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  res.setHeader('Set-Cookie', sessionCookie(createSessionToken()));
  return res.status(200).json({ authenticated: true });
};
