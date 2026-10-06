const assert = require('node:assert/strict');
const { test } = require('node:test');

const nodemailerPath = require.resolve('nodemailer');
const emailPath = require.resolve('../lib/email');
const originalNodemailer = require.cache[nodemailerPath];
const originalEmail = require.cache[emailPath];
const state = {
  createTransportCalls: 0,
  options: null,
  sendMail: async () => ({ messageId: 'message-id', accepted: ['reader@example.com'] })
};

require.cache[nodemailerPath] = {
  id: nodemailerPath,
  filename: nodemailerPath,
  loaded: true,
  exports: {
    createTransport(options) {
      state.createTransportCalls += 1;
      state.options = options;
      return {
        sendMail(message) {
          return state.sendMail(message);
        }
      };
    }
  }
};
delete require.cache[emailPath];

const { sendEmail } = require('../lib/email');

if (originalNodemailer) {
  require.cache[nodemailerPath] = originalNodemailer;
} else {
  delete require.cache[nodemailerPath];
}
if (originalEmail) {
  require.cache[emailPath] = originalEmail;
} else {
  delete require.cache[emailPath];
}

test('email delivery requires both SMTP credentials', async t => {
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  t.mock.method(console, 'error', () => {});

  await assert.rejects(
    sendEmail({ to: 'reader@example.com', subject: 'Update', text: 'News' }),
    /EMAIL_PASS/
  );
  assert.equal(state.createTransportCalls, 0);
});

test('email delivery uses configured sender and logs a safe success event', async t => {
  process.env.EMAIL_USER = 'sender@example.com';
  process.env.EMAIL_PASS = 'smtp-secret';
  process.env.EMAIL_FROM = 'Newsletter <sender@example.com>';
  const info = t.mock.method(console, 'info', () => {});
  const message = {
    to: 'reader@example.com',
    subject: 'Update',
    text: 'News',
    html: '<p>News</p>'
  };
  state.sendMail = async sentMessage => {
    assert.deepEqual(sentMessage, {
      from: 'Newsletter <sender@example.com>',
      ...message
    });
    return { messageId: 'message-123', accepted: ['reader@example.com'] };
  };

  const result = await sendEmail(message);

  assert.equal(result.messageId, 'message-123');
  assert.equal(state.options.service, 'gmail');
  assert.deepEqual(JSON.parse(info.mock.calls[0].arguments[0]), {
    event: 'email.delivery.succeeded',
    messageId: 'message-123',
    acceptedCount: 1
  });
  assert.doesNotMatch(info.mock.calls[0].arguments[0], /reader@example\.com|smtp-secret/);
});

test('email delivery logs safe failure metadata and rethrows SMTP errors', async t => {
  process.env.EMAIL_USER = 'sender@example.com';
  process.env.EMAIL_PASS = 'smtp-secret';
  const errorLog = t.mock.method(console, 'error', () => {});
  const smtpError = Object.assign(new Error('Sensitive SMTP response'), { code: 'ECONNECTION' });
  state.sendMail = async () => {
    throw smtpError;
  };

  await assert.rejects(
    sendEmail({ to: 'reader@example.com', subject: 'Update', text: 'News' }),
    error => error === smtpError
  );

  assert.deepEqual(JSON.parse(errorLog.mock.calls[0].arguments[0]), {
    event: 'email.delivery.failed',
    code: 'ECONNECTION'
  });
  assert.doesNotMatch(errorLog.mock.calls[0].arguments[0], /reader@example\.com|smtp-secret|Sensitive SMTP response/);
});

test('email delivery rejects incomplete sender configuration', async t => {
  process.env.EMAIL_USER = 'sender@example.com';
  delete process.env.EMAIL_PASS;
  t.mock.method(console, 'error', () => {});
  const transportCalls = state.createTransportCalls;

  await assert.rejects(
    sendEmail({ to: 'reader@example.com', subject: 'Update', text: 'News' }),
    /EMAIL_PASS/
  );
  assert.equal(state.createTransportCalls, transportCalls);
});
