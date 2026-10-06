const assert = require('node:assert/strict');
const test = require('node:test');
const { requireEnvironment, validateRuntimeEnvironment } = require('../lib/config');

test('runtime validation accepts a valid full configuration', () => {
  const result = validateRuntimeEnvironment({
    PORT: '3000',
    APP_URL: 'https://newsletter.example.com',
    MONGODB_URI: 'mongodb://localhost/newsletter',
    EMAIL_USER: 'sender@example.com',
    EMAIL_PASS: 'smtp-password',
    NOTIFY_SECRET: 'notify-secret'
  });

  assert.deepEqual(result.warnings, []);
});

test('runtime validation explains disabled optional integrations without values', () => {
  const result = validateRuntimeEnvironment({});

  assert.equal(result.warnings.length, 3);
  assert.ok(result.warnings.some(message => message.includes('MONGODB_URI')));
  assert.ok(result.warnings.some(message => message.includes('EMAIL_USER')));
  assert.ok(result.warnings.some(message => message.includes('NOTIFY_SECRET')));
  assert.ok(result.warnings.every(message => !message.includes('mongodb://')));
});

test('runtime validation rejects invalid ports and non-HTTP application URLs', () => {
  assert.throws(
    () => validateRuntimeEnvironment({ PORT: '70000' }),
    /PORT deve ser um número inteiro/
  );
  assert.throws(
    () => validateRuntimeEnvironment({ APP_URL: 'ftp://newsletter.example.com' }),
    /APP_URL deve ser uma URL HTTP ou HTTPS válida/
  );
  assert.throws(
    () => validateRuntimeEnvironment({ APP_URL: 'not a url' }),
    /APP_URL deve ser uma URL HTTP ou HTTPS válida/
  );
  assert.throws(
    () => validateRuntimeEnvironment({ APP_URL: 'https://user:pass@example.com' }),
    /APP_URL não pode incluir credenciais/
  );
});

test('runtime validation rejects incomplete SMTP credentials without exposing values', () => {
  assert.throws(
    () => validateRuntimeEnvironment({
      EMAIL_USER: 'private-user@example.com',
      EMAIL_PASS: ''
    }),
    error => {
      assert.match(error.message, /EMAIL_USER e EMAIL_PASS juntos/);
      assert.doesNotMatch(error.message, /private-user@example\.com/);
      return true;
    }
  );
});

test('required environment validation names missing variables but not their values', () => {
  assert.throws(
    () => requireEnvironment(['MONGODB_URI', 'EMAIL_PASS'], {
      MONGODB_URI: '',
      EMAIL_PASS: ''
    }),
    error => {
      assert.match(error.message, /MONGODB_URI/);
      assert.match(error.message, /EMAIL_PASS/);
      assert.doesNotMatch(error.message, /secret-value/);
      return true;
    }
  );
});
