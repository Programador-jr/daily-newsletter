const { connectDatabase } = require('../lib/db');
const Subscriber = require('../lib/subscriber');
const { createToken, hashToken } = require('../lib/tokens');
const { sendEmail } = require('../lib/email');
const { enforceRateLimits, getClientIp, getWindowConfig } = require('../lib/rate-limiter');

const CONFIRMATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const CONFIRMATION_EMAIL_COOLDOWN_MS = 60 * 1000;
const GENERIC_MESSAGE = 'Se este endereço puder receber uma confirmação, enviaremos um link por e-mail. Verifique também a caixa de spam. Se você já solicitou um link recentemente, aguarde um minuto antes de tentar novamente.';

function getAppUrl(req) {
  return (process.env.APP_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');
}

function isValidEmail(email) {
  return typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getConfirmationEmail(email, token, req) {
  const confirmationUrl = `${getAppUrl(req)}/api/confirm?token=${token}`;

  return {
    kind: 'subscription_confirmation',
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
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const limits = getWindowConfig();
  const rateLimitChecks = [{
    scope: 'subscribe:ip',
    identifier: getClientIp(req),
    limit: limits.subscribeIpLimit,
    windowMs: limits.windowMs
  }];

  if (isValidEmail(email)) {
    rateLimitChecks.push({
      scope: 'subscribe:email',
      identifier: email,
      limit: limits.subscribeEmailLimit,
      windowMs: limits.windowMs
    });
  }

  try {
    if (!await enforceRateLimits(req, res, rateLimitChecks)) return;
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'A proteção contra tentativas excessivas está temporariamente indisponível.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  try {
    await connectDatabase();

    let subscriber = await Subscriber.findOne({ email });

    // Never reveal whether an address is subscribed or already confirmed.
    if (subscriber?.confirmed) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    const now = new Date();
    const lastSentAt = subscriber?.confirmationEmailSentAt
      ? new Date(subscriber.confirmationEmailSentAt).getTime()
      : 0;

    if (lastSentAt && now.getTime() - lastSentAt < CONFIRMATION_EMAIL_COOLDOWN_MS) {
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    if (!subscriber) {
      subscriber = new Subscriber({
        email,
        confirmed: false,
        confirmationTokenHash: null,
        confirmationTokenExpiresAt: null,
        confirmationEmailSentAt: null,
        unsubscribeTokenHash: null,
        subscribedAt: now
      });
    }

    // Keep the previous valid link available if delivery fails.
    const previousState = {
      confirmed: subscriber.confirmed,
      confirmationTokenHash: subscriber.confirmationTokenHash,
      confirmationTokenExpiresAt: subscriber.confirmationTokenExpiresAt,
      confirmationEmailSentAt: subscriber.confirmationEmailSentAt,
      unsubscribeTokenHash: subscriber.unsubscribeTokenHash
    };

    const token = createToken();
    subscriber.confirmed = false;
    subscriber.confirmationTokenHash = hashToken(token);
    subscriber.confirmationTokenExpiresAt = new Date(now.getTime() + CONFIRMATION_TOKEN_TTL_MS);
    subscriber.confirmationEmailSentAt = now;

    if (!subscriber.unsubscribeTokenHash) {
      subscriber.unsubscribeTokenHash = hashToken(createToken());
    }

    await subscriber.save();

    try {
      await sendEmail(getConfirmationEmail(email, token, req));
    } catch (emailError) {
      // Roll back the new token and cooldown so a failed delivery does not
      // invalidate a previously sent link or block an immediate retry.
      Object.assign(subscriber, previousState);
      try {
        await subscriber.save();
      } catch (rollbackError) {
        console.error('Falha ao restaurar o estado da confirmação após erro de e-mail:', rollbackError);
      }
      console.error('Falha ao enviar e-mail de confirmação:', emailError);
      // Keep the response identical for existing, confirmed, and unknown addresses.
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    return res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Erro ao cadastrar inscrito:', error);
    return res.status(500).json({ error: 'Não foi possível processar a solicitação agora.' });
  }
};
