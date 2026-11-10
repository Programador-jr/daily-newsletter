const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  createSessionToken,
  isSessionValid,
  sessionCookie,
  verifyCredentials
} = require('../lib/admin-auth');
let rateLimitBlocked = false;
const rateLimiterPath = require.resolve('../lib/rate-limiter');
const originalRateLimiterModule = require.cache[rateLimiterPath];
require.cache[rateLimiterPath] = {
  id: rateLimiterPath,
  filename: rateLimiterPath,
  loaded: true,
  exports: {
    enforceRateLimits: async (req, res) => {
      if (!rateLimitBlocked) return true;
      res.setHeader('Retry-After', '60');
      res.setHeader('Cache-Control', 'no-store');
      res.status(429).json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.', retryAfterSeconds: 60 });
      return false;
    },
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
  ADMIN_PASSWORD: 'Long-Password-4-testing',
  ADMIN_SESSION_SECRET: 'a-session-secret-with-at-least-32-characters'
};

test('admin credentials are checked without storing a session in browser storage', () => {
  assert.equal(verifyCredentials('dashboard-admin', 'Long-Password-4-testing', environment), true);
  assert.equal(verifyCredentials('dashboard-admin', 'incorrect', environment), false);
  assert.equal(verifyCredentials('wrong', 'Long-Password-4-testing', environment), false);
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

test('admin login stops credential checks when the distributed rate limit is exceeded', async t => {
  const names = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  Object.assign(process.env, environment);
  t.after(() => {
    rateLimitBlocked = false;
    names.forEach(name => {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    });
  });

  rateLimitBlocked = true;
  const response = mockResponse();
  await login({
    method: 'POST',
    headers: { 'x-real-ip': '203.0.113.11' },
    body: { username: 'dashboard-admin', password: 'Long-Password-4-testing' }
  }, response);

  assert.equal(response.statusCode, 429);
  assert.equal(response.headers['Retry-After'], '60');
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.headers['Set-Cookie'], undefined);
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

test('admin password policy requires 8+ characters, an uppercase letter, a digit and a special character', () => {
  const { passwordPolicyFailures, isStrongPassword } = require('../lib/password-policy');
  assert.equal(isStrongPassword('Senha#2026'), true);
  assert.equal(isStrongPassword('Açaí-9xx'), true, 'accented uppercase letters count');
  assert.deepEqual(passwordPolicyFailures('Ab1#'), ['pelo menos 8 caracteres']);
  assert.deepEqual(passwordPolicyFailures('senha#2026'), ['uma letra maiúscula']);
  assert.deepEqual(passwordPolicyFailures('Senha#Forte'), ['um número']);
  assert.deepEqual(passwordPolicyFailures('Senha2026'), ['um caractere especial']);
  assert.deepEqual(passwordPolicyFailures('Senha 2026'), ['um caractere especial'], 'a space is not a special character');
  assert.equal(passwordPolicyFailures('').length, 4);
});

test('a weak ADMIN_PASSWORD keeps the panel closed without revealing which rule it breaks', async t => {
  const { hasAdminConfiguration, adminConfigurationCode } = require('../lib/admin-auth');
  const { validateRuntimeEnvironment } = require('../lib/config');
  const weak = { ...environment, ADMIN_PASSWORD: 'Senha2026' };
  assert.equal(hasAdminConfiguration(environment), true);
  assert.equal(hasAdminConfiguration(weak), false);
  assert.equal(verifyCredentials('dashboard-admin', 'Senha2026', weak), false);
  assert.equal(adminConfigurationCode(weak), 'ADMIN_PASSWORD_POLICY');
  assert.equal(adminConfigurationCode(environment), null);

  // Startup warnings state the whole rule, not the missing part.
  const startupWarning = validateRuntimeEnvironment(weak).warnings.find(item => item.includes('ADMIN_PASSWORD'));
  assert.ok(startupWarning);
  assert.equal(startupWarning, validateRuntimeEnvironment({ ...environment, ADMIN_PASSWORD: 'senha#forte' }).warnings.find(item => item.includes('ADMIN_PASSWORD')));

  const names = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  Object.assign(process.env, weak);
  const logged = [];
  const originalError = console.error;
  console.error = message => logged.push(String(message));
  t.after(() => {
    console.error = originalError;
    names.forEach(name => {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    });
  });
  rateLimitBlocked = false;
  const response = mockResponse();
  await login({ method: 'POST', headers: { 'x-real-ip': '203.0.113.12' }, body: { username: 'dashboard-admin', password: 'Senha2026' } }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'Acesso administrativo indisponível no momento.');
  assert.doesNotMatch(JSON.stringify(response.body), /ADMIN_PASSWORD|caractere|maiúscula|número|senha/i);
  assert.equal(response.headers['Set-Cookie'], undefined);
  assert.deepEqual(logged.map(line => JSON.parse(line)), [{ event: 'admin.login.unavailable', reason: 'ADMIN_PASSWORD_POLICY' }]);
});
