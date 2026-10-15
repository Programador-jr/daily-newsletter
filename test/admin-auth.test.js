const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  createSessionToken,
  isSessionValid,
  sessionCookie,
  verifyCredentials
} = require('../lib/admin-auth');
const rateLimiterPath = require.resolve('../lib/rate-limiter');
const originalRateLimiterModule = require.cache[rateLimiterPath];
require.cache[rateLimiterPath] = {
  id: rateLimiterPath,
  filename: rateLimiterPath,
  loaded: true,
  exports: {
    enforceRateLimits: async () => true,
    getClientIp: req => req.headers?.['x-real-ip'] || req.ip || 'test-ip',
    getWindowConfig: () => ({
      windowMs: 900000,
      subscribeIpLimit: 10,
      subscribeEmailLimit: 3,
      adminIpLimit: 10,
      adminUserLimit: 5
    })
  }
};
const login = require('../lib/api-handlers/admin/login');
if (originalRateLimiterModule) require.cache[rateLimiterPath] = originalRateLimiterModule;
else delete require.cache[rateLimiterPath];
const dashboard = require('../lib/api-handlers/admin/dashboard');
const dispatch = require('../lib/api-handlers/admin/dispatch');

const environment = {
  ADMIN_USERNAME: 'dashboard-admin',
  ADMIN_PASSWORD: 'a-long-password-for-testing-only',
  ADMIN_SESSION_SECRET: 'a-session-secret-with-at-least-32-characters'
};

test('admin credentials are checked without storing a session in browser storage', () => {
  assert.equal(verifyCredentials('dashboard-admin', 'a-long-password-for-testing-only', environment), true);
  assert.equal(verifyCredentials('dashboard-admin', 'incorrect', environment), false);
  assert.equal(verifyCredentials('wrong', 'a-long-password-for-testing-only', environment), false);
});

test('admin session expires and rejects altered signatures', () => {
  const now = Date.UTC(2026, 9, 10, 12);
  const token = createSessionToken(environment, now);
  const request = { headers: { cookie: `kings_admin_session=${token}` } };

  assert.equal(isSessionValid(request, environment, now), true);
  assert.equal(isSessionValid(request, environment, now + (8 * 60 * 60 * 1000)), false);
  request.headers.cookie = `kings_admin_session=${token.slice(0, -1)}x`;
  assert.equal(isSessionValid(request, environment, now), false);
});

test('session cookie is HTTP-only, same-site, scoped and secure in production', () => {
  const cookie = sessionCookie('session-value', { production: true });
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\/api\/admin/);
  assert.match(cookie, /Secure/);
});

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

test('admin API refuses login when credentials are not configured', async t => {
  const names = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
  t.after(() => names.forEach(name => {
    if (previous[name] === undefined) delete process.env[name];
    else process.env[name] = previous[name];
  }));

  const response = mockResponse();
  await login({ method: 'POST', body: {} }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('dashboard requires an administrator session and the site MongoDB URI', async t => {
  const names = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'MONGODB_URI'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  Object.assign(process.env, environment);
  delete process.env.MONGODB_URI;
  t.after(() => names.forEach(name => {
    if (previous[name] === undefined) delete process.env[name];
    else process.env[name] = previous[name];
  }));

  const unauthorized = mockResponse();
  await dashboard({ method: 'GET', headers: {}, query: {} }, unauthorized);
  assert.equal(unauthorized.statusCode, 401);

  const token = createSessionToken();
  const authorized = mockResponse();
  await dashboard({
    method: 'GET', headers: { cookie: `kings_admin_session=${token}` }, query: {}
  }, authorized);
  assert.equal(authorized.statusCode, 503);
  assert.match(authorized.body.error, /MONGODB_URI/);
});

test('manual dispatch cannot be triggered without an authenticated admin session', async () => {
  const response = mockResponse();
  await dispatch({ method: 'POST', headers: {} }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});
