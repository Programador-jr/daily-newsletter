const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const required = ['EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(name => !process.env[name]);

  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes para Gmail: ${missing.join(', ')}.`);
  }

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
  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text
  });
}

module.exports = { sendEmail };
