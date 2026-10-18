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

async function sendEmail({ to, subject, html, text, kind = 'other' }) {
  try {
    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
      disableFileAccess: true,
      disableUrlAccess: true
    });

    await recordEmailEvent({
      kind,
      status: result.accepted?.length && result.rejected?.length
        ? 'partially_accepted'
        : result.accepted?.length ? 'accepted' : 'failed',
      acceptedCount: result.accepted?.length ?? 0,
      rejectedCount: result.rejected?.length ?? 0,
      errorCode: result.accepted?.length ? null : 'SMTP_NO_ACCEPTED_RECIPIENTS'
    });

    console.info(JSON.stringify({
      event: 'email.delivery.succeeded',
      messageId: result.messageId || null,
      acceptedCount: result.accepted?.length ?? null
    }));

    return result;
  } catch (error) {
    await recordEmailEvent({
      kind,
      status: 'failed',
      acceptedCount: 0,
      rejectedCount: 0,
      errorCode: safeErrorCode(error)
    });
    console.error(JSON.stringify({
      event: 'email.delivery.failed',
      code: error.code || error.name || 'EMAIL_DELIVERY_ERROR'
    }));
    throw error;
  }
}

function safeErrorCode(error) {
  const code = error?.code || error?.name || 'EMAIL_DELIVERY_ERROR';
  return /^[A-Z0-9_]+$/.test(code) ? code : 'EMAIL_DELIVERY_ERROR';
}

async function recordEmailEvent(event) {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;
    const EmailEvent = require('./email-event');
    await EmailEvent.create(event);
  } catch (error) {
    console.warn(JSON.stringify({
      event: 'email.event.persistence.failed',
      code: safeErrorCode(error)
    }));
  }
}

module.exports = { sendEmail };
