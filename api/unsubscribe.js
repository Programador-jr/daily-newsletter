const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { hashToken } = require('../lib/tokens');

module.exports = async function handler(req, res) {
  const token = String(req.query?.token || '');

  if (!token) {
    return res.redirect('/subscription-status?status=invalid');
  }

  try {
    await connectDatabase();

    const subscriber = await Subscriber.findOne({
      unsubscribeTokenHash: hashToken(token),
      confirmed: true
    });

    if (!subscriber) {
      return res.redirect('/subscription-status?status=invalid');
    }

    subscriber.confirmed = false;
    await subscriber.save();

    return res.redirect('/subscription-status?status=unsubscribed');
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return res.redirect('/subscription-status?status=error');
  }
};
