const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { hashToken } = require('../lib/tokens');

module.exports = async function handler(req, res) {
  const token = String(req.query?.token || '');

  if (!token) {
    return res.status(400).send('Token de descadastro ausente.');
  }

  try {
    await connectDatabase();

    const subscriber = await Subscriber.findOne({
      unsubscribeTokenHash: hashToken(token),
      confirmed: true
    });

    if (!subscriber) {
      return res.status(400).send('Este link de descadastro é inválido.');
    }

    subscriber.confirmed = false;
    await subscriber.save();

    return res.redirect('/?subscription=unsubscribed');
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return res.status(500).send('Não foi possível cancelar a inscrição agora.');
  }
};
