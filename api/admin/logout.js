const { sessionCookie } = require('../../lib/admin-auth');

module.exports = async function logout(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  res.setHeader('Set-Cookie', sessionCookie('', { clear: true }));
  return res.status(200).json({ authenticated: false });
};
