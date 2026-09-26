const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { createToken, hashToken } = require('../lib/tokens');
const { sendEmail } = require('../lib/email');

function getAppUrl(req) {
  return (process.env.APP_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');
}

function isValidEmail(email) {
  return typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  try {
    await connectDatabase();

    let subscriber = await Subscriber.findOne({ email });
    const token = createToken();

    if (subscriber?.confirmed) {
      return res.status(200).json({
        message: 'Este e-mail já está inscrito no King\'s Newsletter.'
      });
    }

    if (!subscriber) {
      subscriber = new Subscriber({
        email,
        subscribedAt: new Date()
      });
    }

    subscriber.confirmed = false;
    subscriber.confirmationTokenHash = hashToken(token);
    subscriber.confirmationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (!subscriber.unsubscribeTokenHash) {
      subscriber.unsubscribeTokenHash = hashToken(createToken());
    }

    await subscriber.save();

    const confirmationUrl = `${getAppUrl(req)}/api/confirm?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Confirme sua inscrição — King's Newsletter",
      text: `Confirme sua inscrição no King's Newsletter: ${confirmationUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1c2d2a">
          <h1 style="margin-bottom:8px">King's Newsletter</h1>
          <p>Você solicitou receber novas atualizações por e-mail.</p>
          <p>Confirme sua inscrição clicando no botão abaixo:</p>
          <p><a href="${confirmationUrl}" style="display:inline-block;padding:12px 20px;background:#0b766b;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Confirmar inscrição</a></p>
          <p style="font-size:13px;color:#536762">O link é válido por 24 horas.</p>
          <p style="font-size:13px;color:#536762">Se você não solicitou esta inscrição, ignore esta mensagem.</p>
        </div>
      `
    });

    return res.status(201).json({
      message: 'Inscrição recebida. Verifique seu e-mail para confirmar.'
    });
  } catch (error) {
    console.error('Erro ao cadastrar inscrito:', error);
    return res.status(500).json({ error: 'Não foi possível concluir a inscrição agora.' });
  }
};
