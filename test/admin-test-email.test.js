const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createSessionToken } = require('../lib/admin-auth');
const testEmail = require('../lib/api-handlers/admin/test-email');

const environmentKeys = [
  'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET',
  'VERCEL_ENV', 'VERCEL_GIT_COMMIT_REF', 'MONGODB_NAME', 'MONGODB_DB_NAME'
];

function configurePreview(t, overrides = {}) {
  const previous = Object.fromEntries(environmentKeys.map(key => [key, process.env[key]]));
  Object.assign(process.env, {
    ADMIN_USERNAME: 'newsletter-admin',
    ADMIN_PASSWORD: 'test-password',
    ADMIN_SESSION_SECRET: 'test-session-secret-with-more-than-32-characters',
    VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_REF: 'reconciliation/newsletter-r2-homepage',
    MONGODB_DB_NAME: 'kings_newsletter_preview',
    ...overrides
  });
  t.after(() => {
    for (const key of environmentKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
}

function mockResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('newsletter test email requires an authenticated admin session', async t => {
  configurePreview(t);
  const response = mockResponse();
  await testEmail({ method: 'POST', headers: {} }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('newsletter test email is available in production for an authenticated admin', async t => {
  configurePreview(t, { VERCEL_ENV: 'production' });
  const token = createSessionToken();
  const response = mockResponse();
  await testEmail({ method: 'POST', headers: { cookie: 'kings_admin_session=' + token }, body: { email: 'invalid' } }, response);
  assert.equal(response.statusCode, 400);
});

test('newsletter test email validates the recipient supplied by the admin', async t => {
  configurePreview(t);
  const token = createSessionToken();
  const response = mockResponse();
  await testEmail({ method: 'POST', headers: { cookie: 'kings_admin_session=' + token }, body: { email: 'invalid' } }, response);
  assert.equal(response.statusCode, 400);
});

test('newsletter test email endpoint only accepts POST', async () => {
  const response = mockResponse();
  await testEmail({ method: 'GET', headers: {} }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
});
