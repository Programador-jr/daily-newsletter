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
    if (typeof to !== 'string' || /[,;]/.test(to)) {
      throw Object.assign(new Error('Email delivery requires exactly one recipient.'), {
        code: 'EMAIL_SINGLE_RECIPIENT_REQUIRED'
      });
    }

    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
      disableFileAccess: true,
      disableUrlAccess: true
    });

    const recipientAccepted = Array.isArray(result.accepted) && result.accepted.some(address =>
      String(address).trim().toLowerCase() === to.trim().toLowerCase()
    );
    if (!recipientAccepted) {
      throw Object.assign(new Error('SMTP did not accept the addressed recipient.'), {
        code: 'SMTP_RECIPIENT_NOT_ACCEPTED'
      });
    }

    await recordEmailEvent({
      kind,
      status: 'accepted',
      acceptedCount: 1,
      rejectedCount: 0,
      errorCode: null
    });

    console.info(JSON.stringify({
      event: 'email.delivery.succeeded',
      messageId: result.messageId || null,
      acceptedCount: recipientAccepted ? 1 : 0
    }));

    return result;
  } catch (error) {
    await recordEmailEvent({
      kind,
      status: 'failed',
      acceptedCount: 0,
      rejectedCount: 1,
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
