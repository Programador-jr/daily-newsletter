const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');

const state = {
  counters: new Map(),
  connectCalls: 0
};

const dbPath = require.resolve('../lib/db');
const counterPath = require.resolve('../lib/rate-limit-counter');
const originalDb = require.cache[dbPath];
const originalCounter = require.cache[counterPath];

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    connectDatabase: async () => {
      state.connectCalls += 1;
    }
  }
};

require.cache[counterPath] = {
  id: counterPath,
  filename: counterPath,
  loaded: true,
  exports: {
    findOneAndUpdate: async (filter, update) => {
      const key = filter._id;
      let counter = state.counters.get(key);
      if (!counter) {
        counter = {
          _id: key,
          count: 0,
          expiresAt: update.$setOnInsert?.expiresAt
        };
      }
      counter.count += update.$inc?.count || 0;
      state.counters.set(key, counter);
      return { ...counter };
    }
  }
};

const {
  consumeRateLimit,
  enforceRateLimits,
  getClientIp,
  getWindowConfig
} = require('../lib/rate-limiter');

if (originalDb) require.cache[dbPath] = originalDb;
else delete require.cache[dbPath];
if (originalCounter) require.cache[counterPath] = originalCounter;
else delete require.cache[counterPath];

beforeEach(() => {
  state.counters.clear();
  state.connectCalls = 0;
});

test('distributed counter blocks attempts above the limit and reports remaining capacity', async () => {
  const options = { limit: 2, windowMs: 60_000, now: 120_000 };
  const first = await consumeRateLimit('subscribe:ip', '203.0.113.8', options);
  const second = await consumeRateLimit('subscribe:ip', '203.0.113.8', options);
  const third = await consumeRateLimit('subscribe:ip', '203.0.113.8', options);

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
  assert.equal(third.retryAfterSeconds, 60);
  assert.equal(state.connectCalls, 3);
});

test('counter isolates identifiers, scopes, and fixed time windows', async () => {
  const first = await consumeRateLimit('subscribe:email', 'Reader@example.com', {
    limit: 1, windowMs: 60_000, now: 10_000
  });
  const differentEmail = await consumeRateLimit('subscribe:email', 'other@example.com', {
    limit: 1, windowMs: 60_000, now: 10_000
  });
  const differentScope = await consumeRateLimit('admin-login:username', 'reader@example.com', {
    limit: 1, windowMs: 60_000, now: 10_000
  });
  const nextWindow = await consumeRateLimit('subscribe:email', 'reader@example.com', {
    limit: 1, windowMs: 60_000, now: 70_000
  });

  assert.equal(first.allowed, true);
  assert.equal(differentEmail.allowed, true);
  assert.equal(differentScope.allowed, true);
  assert.equal(nextWindow.allowed, true);
  assert.equal(state.counters.size, 4);
  for (const key of state.counters.keys()) {
    assert.doesNotMatch(key, /reader|example|203\.0\.113/);
  }
});

test('invalid rate limit configuration is rejected instead of silently disabling protection', async () => {
  await assert.rejects(
    consumeRateLimit('subscribe:ip', '203.0.113.8', { limit: 0, windowMs: 60_000 }),
    /Configuração de rate limit inválida/
  );
});

test('rate limit configuration accepts valid environment overrides and falls back safely', () => {
  assert.deepEqual(getWindowConfig({
    RATE_LIMIT_WINDOW_MS: '30000',
    RATE_LIMIT_SUBSCRIBE_IP_MAX: '20',
    RATE_LIMIT_SUBSCRIBE_EMAIL_MAX: '4',
    RATE_LIMIT_ADMIN_LOGIN_IP_MAX: '8',
    RATE_LIMIT_ADMIN_LOGIN_USER_MAX: '3'
  }), {
    windowMs: 30_000,
    subscribeIpLimit: 20,
    subscribeEmailLimit: 4,
    adminIpLimit: 8,
    adminUserLimit: 3
  });

  assert.equal(getWindowConfig({ RATE_LIMIT_WINDOW_MS: '-1' }).windowMs, 900_000);
});

test('enforcement returns HTTP 429, Retry-After and no-store when the limit is exceeded', async () => {
  const req = {
    headers: { 'x-real-ip': '203.0.113.9' },
    ip: '127.0.0.1'
  };
  const res = {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };

  const checks = [{
    scope: 'subscribe:ip',
    identifier: '203.0.113.9',
    limit: 1,
    windowMs: 60_000
  }];

  assert.equal(await enforceRateLimits(req, res, checks, { now: 1_000 }), true);
  const blocked = {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  assert.equal(await enforceRateLimits(req, blocked, checks, { now: 1_000 }), false);
  assert.equal(blocked.statusCode, 429);
  assert.match(blocked.headers['Retry-After'], /^\d+$/);
  assert.equal(blocked.headers['Cache-Control'], 'no-store');
  assert.equal(blocked.headers['RateLimit-Remaining'], '0');
  assert.equal(blocked.body.retryAfterSeconds, 59);
});

test('client IP extraction prefers the trusted real-IP header and uses the last forwarded address', () => {
  assert.equal(getClientIp({ headers: { 'x-real-ip': '203.0.113.1' }, ip: '127.0.0.1' }), '203.0.113.1');
  assert.equal(
    getClientIp({ headers: { 'x-forwarded-for': '198.51.100.10, 203.0.113.2' } }),
    '203.0.113.2'
  );
});
