const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { hashToken } = require('../lib/tokens');

module.exports = async function handler(req, res) {
  const token = String(req.query?.token || '');

  if (!token) {
    return res.status(400).send('Token de confirmação ausente.');
  }

  try {
    await connectDatabase();

    const subscriber = await Subscriber.findOne({
      confirmationTokenHash: hashToken(token),
      confirmationTokenExpiresAt: { $gt: new Date() }
    });

    if (!subscriber) {
      return res.status(400).send('Este link de confirmação é inválido ou expirou.');
    }

    subscriber.confirmed = true;
    subscriber.confirmedAt = new Date();
    subscriber.confirmationTokenHash = null;
    subscriber.confirmationTokenExpiresAt = null;
    await subscriber.save();

    return res.redirect('/?subscription=confirmed');
  } catch (error) {
    console.error('Erro ao confirmar inscrição:', error);
    return res.status(500).send('Não foi possível confirmar a inscrição agora.');
  }
};
