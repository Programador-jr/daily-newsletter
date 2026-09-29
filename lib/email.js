const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const required = ['EMAIL_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Variáveis de ambiente ausentes para Gmail OAuth2: ${missing.join(', ')}.`);
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  return getTransporter().sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html, text });
}

module.exports = { sendEmail };