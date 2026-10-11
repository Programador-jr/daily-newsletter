const {
  createSessionToken,
  hasAdminConfiguration,
  sessionCookie,
  verifyCredentials
} = require('../../lib/admin-auth');

module.exports = async function login(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!hasAdminConfiguration()) {
    return res.status(503).json({ error: 'Acesso administrativo ainda não configurado.' });
  }

  const username = String(req.body?.username || '');
  const password = String(req.body?.password || '');
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  res.setHeader('Set-Cookie', sessionCookie(createSessionToken()));
  return res.status(200).json({ authenticated: true });
};
