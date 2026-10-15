const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { hashToken } = require('../lib/tokens');

module.exports = async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const token = String(req.method === 'POST' ? req.body?.token || '' : req.query?.token || '');
  if (!token || token.length > 256) return res.redirect('/subscription-status?status=invalid');
  try {
    await connectDatabase();
    const subscriber = await Subscriber.findOne({
      $or: [{ unsubscribeTokenHash: hashToken(token) }, { unsubscribeTokenHash: token }],
      confirmed: true
    });
    if (!subscriber) return res.redirect('/subscription-status?status=invalid');
    // GET is a preview only: email link scanners must never mutate subscription state.
    if (req.method === 'GET') {
      return res.redirect('/subscription-status?status=unsubscribe-confirm&token=' + encodeURIComponent(token));
    }
    subscriber.confirmed = false;
    await subscriber.save();
    return res.redirect('/subscription-status?status=unsubscribed');
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error?.name || 'UnexpectedError');
    return res.redirect('/subscription-status?status=error');
  }
};
