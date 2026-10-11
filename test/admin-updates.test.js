const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createSessionToken } = require('../lib/admin-auth');
const adminUpdates = require('../lib/api-handlers/admin/updates');
const activeUpdate = require('../lib/api-handlers/updates/active');

function mockResponse() {
  return {
    headers: {}, statusCode: null, body: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

const envNames = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'MONGODB_URI'];
function setTestEnvironment(t, { withMongo = true } = {}) {
  const previous = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  Object.assign(process.env, {
    ADMIN_USERNAME: 'dashboard-admin',
    ADMIN_PASSWORD: 'testing-password-only',
    ADMIN_SESSION_SECRET: 'testing-session-secret-with-at-least-32-characters'
  });
  if (withMongo) process.env.MONGODB_URI = 'mongodb://localhost/kings_newsletter_test';
  else delete process.env.MONGODB_URI;
  t.after(() => envNames.forEach(name => {
    if (previous[name] === undefined) delete process.env[name];
    else process.env[name] = previous[name];
  }));
}

test('admin updates API requires an administrator session', async () => {
  const response = mockResponse();
  await adminUpdates({ method: 'GET', headers: {} }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('deleting an update requires an authenticated administrator', async () => {
  const response = mockResponse();
  await adminUpdates({ method: 'DELETE', headers: {}, body: { id: '507f1f77bcf86cd799439011' } }, response);
  assert.equal(response.statusCode, 401);
});

test('deleting an update rejects malformed ids before database access', async t => {
  setTestEnvironment(t);
  const token = createSessionToken();
  const response = mockResponse();
  await adminUpdates({ method: 'DELETE', headers: { cookie: `kings_admin_session=${token}` }, body: { id: 'not-an-id' } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /não encontrada/i);
});

test('admin updates API validates content, schedule, and display limit before database access', async t => {
  setTestEnvironment(t);
  const token = createSessionToken();
  const response = mockResponse();
  await adminUpdates({
    method: 'POST', headers: { cookie: `kings_admin_session=${token}` },
    body: { title: 'Atualização', body: 'Mudanças', startsAt: '2026-10-10T10:00:00.000Z',
      endsAt: '2026-10-09T10:00:00.000Z', maxDisplays: 0, active: true }
  }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /período/);
});

test('admin updates API refuses to activate an already expired notice', async t => {
  setTestEnvironment(t);
  const token = createSessionToken();
  const response = mockResponse();
  await adminUpdates({
    method: 'POST', headers: { cookie: `kings_admin_session=${token}` },
    body: { title: 'Aviso', body: 'Mudança', startsAt: '2026-10-01T10:00:00.000Z',
      endsAt: '2026-10-02T10:00:00.000Z', maxDisplays: 2, active: true }
  }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /data final futura/);
});

test('public active update endpoint gracefully returns an empty result without MongoDB configuration', async t => {
  setTestEnvironment(t, { withMongo: false });
  const response = mockResponse();
  await activeUpdate({ method: 'GET' }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { update: null });
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('public active update endpoint only permits GET', async () => {
  const response = mockResponse();
  await activeUpdate({ method: 'POST' }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET');
});
