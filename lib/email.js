const nodemailer = require('nodemailer');
const { requireEnvironment } = require('./config');

let transporter;

function getTransporter() {
  requireEnvironment(['EMAIL_USER', 'EMAIL_PASS']);
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  try {
    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    });

    console.info(JSON.stringify({
      event: 'email.delivery.succeeded',
      messageId: result.messageId || null,
      acceptedCount: result.accepted?.length ?? null
    }));

    return result;
  } catch (error) {
    console.error(JSON.stringify({
      event: 'email.delivery.failed',
      code: error.code || error.name || 'EMAIL_DELIVERY_ERROR'
    }));
    throw error;
  }
}

module.exports = { sendEmail };
