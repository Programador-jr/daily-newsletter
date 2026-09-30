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
      confirmationTokenHash: hashToken(token),
      confirmationTokenExpiresAt: { $gt: new Date() }
    });

    if (!subscriber) {
      return res.redirect('/subscription-status?status=invalid');
    }

    subscriber.confirmed = true;
    subscriber.confirmedAt = new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationTokenExpiresAt = null;
    await subscriber.save();

    return res.redirect('/subscription-status?status=confirmed');
  } catch (error) {
    console.error('Erro ao confirmar inscrição:', error);
    return res.redirect('/subscription-status?status=error');
  }
};
