const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const { hashToken } = require('../lib/tokens');

const state = {
  databaseCalls: 0,
  databaseError: null,
  findCalls: [],
  bulkWriteCalls: [],
  findSubscriber: null,
  subscriberQueries: [],
  savedSubscribers: [],
  sentEmails: [],
  emailError: null,
  notificationCalls: 0,
  bulkWriteResult: { upsertedCount: 0, modifiedCount: 0 },
  latestNews: [],
  historyNews: [],
  rateLimitBlocked: false,
  rateLimitCalls: []
};

const modules = {
  '../lib/db': {
    connectDatabase: async () => {
      state.databaseCalls += 1;
      if (state.databaseError) throw state.databaseError;
    }
  },
  '../lib/news': {
    find: (...args) => {
      state.findCalls.push(args);

      if (args.length === 0) {
        return {
          select: () => ({
            lean: async () => state.historyNews
          })
        };
      }

      return { lean: async () => state.latestNews };
    },
    aggregate: async pipeline => {
      const all = [...state.historyNews, ...state.latestNews];
      const parse = value => {
        const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        return match ? Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : 0;
      };
      const latest = all.map(row => row.editionDate).sort((x,y) => parse(y)-parse(x))[0] || null;
      if (pipeline.some(stage => stage.$group)) {
        const counts = new Map();
        for (const row of state.historyNews) {
          if (row.editionDate === latest && row.publishedAt && row.publishedAt !== latest) continue;
          counts.set(row.editionDate, (counts.get(row.editionDate) || 0) + 1);
        }
        return [...counts].map(([date, stories]) => ({ date, stories, title: 'Edição de ' + date }))
          .sort((x,y) => parse(y.date)-parse(x.date));
      }
      const match = pipeline.find(stage => stage.$match && stage.$match.editionDate);
      if (match) return state.latestNews.filter(row =>
        (row.editionDate === undefined || row.editionDate === match.$match.editionDate) &&
        (!match.$match.publishedAt || row.publishedAt === match.$match.publishedAt)
      ).sort((x,y) => Number(Boolean(y.headline))-Number(Boolean(x.headline)));
      return latest ? [{ editionDate: latest }] : [];
    },
    bulkWrite: async (...args) => {
      state.bulkWriteCalls.push(args);
      return state.bulkWriteResult;
    }
  },
  '../lib/subscriber': class Subscriber {
    constructor(values) {
      Object.assign(this, values);
    }

    static async findOne(query) {
      state.subscriberQueries.push(query);
      return state.findSubscriber;
    }

    async save() {
      if (!state.savedSubscribers.includes(this)) state.savedSubscribers.push(this);
    }
  },
  '../lib/tokens': require('../lib/tokens'),
  '../lib/email': {
    sendEmail: async message => {
      if (state.emailError) throw state.emailError;
      state.sentEmails.push(message);
    }
  },
  '../lib/rate-limiter': {
    enforceRateLimits: async (req, res, checks) => {
      state.rateLimitCalls.push(checks);
      if (!state.rateLimitBlocked) return true;
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
  },
  '../api/notify-news': {
    notifyLatestNews: async () => {
      state.notificationCalls += 1;
      return { sent: true, newStories: 1, recipients: 2 };
    }
  }
};

const originalModules = new Map();

for (const [modulePath, exports] of Object.entries(modules)) {
  const resolvedPath = require.resolve(modulePath);
  originalModules.set(resolvedPath, require.cache[resolvedPath]);
  require.cache[resolvedPath] = {
    id: resolvedPath,
    filename: resolvedPath,
    loaded: true,
    exports
  };
}

const newsHandler = require('../api/news');
const subscribeHandler = require('../api/subscribe');
const confirmHandler = require('../api/confirm');
const unsubscribeHandler = require('../api/unsubscribe');

for (const [resolvedPath, originalModule] of originalModules) {
  if (originalModule) {
    require.cache[resolvedPath] = originalModule;
  } else {
    delete require.cache[resolvedPath];
  }
}

function createResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    redirectTo: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(body) {
      this.body = body;
      return this;
    },
    redirect(path) {
      this.redirectTo = path;
      return this;
    }
  };
}

function createRequest(overrides = {}) {
  return {
    method: 'GET',
    query: {},
    headers: {},
    body: {},
    ...overrides
  };
}

beforeEach(() => {
  state.databaseCalls = 0;
  state.databaseError = null;
  state.findCalls = [];
  state.bulkWriteCalls = [];
  state.findSubscriber = null;
  state.subscriberQueries = [];
  state.savedSubscribers = [];
  state.sentEmails = [];
  state.emailError = null;
  state.notificationCalls = 0;
  state.bulkWriteResult = { upsertedCount: 0, modifiedCount: 0 };
  state.latestNews = [];
  state.historyNews = [];
  state.rateLimitBlocked = false;
  state.rateLimitCalls = [];
  process.env.NOTIFY_SECRET = 'test-notify-secret';
  process.env.APP_URL = 'http://localhost:3000';
});

test('news endpoint rejects unsupported methods without connecting to MongoDB', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ method: 'DELETE' }), response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, POST');
  assert.equal(state.databaseCalls, 0);
});

test('news endpoint reports database failures as server errors', async t => {
  t.mock.method(console, 'error', () => {});
  state.databaseError = new Error('database unavailable');
  const response = createResponse();

  await newsHandler(createRequest(), response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error, 'Não foi possível salvar as notícias.');
});

test('news endpoint rejects malformed and impossible edition dates', async () => {
  for (const date of ['2026-10-06', '31/02/2026', '']) {
    const response = createResponse();
    await newsHandler(createRequest({ query: { date } }), response);

    if (date) {
      assert.equal(response.statusCode, 400);
      assert.equal(response.body.error, 'Data inválida.');
    } else {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { date: null, stories: [] });
    }
  }
});

test('news history groups editions and sorts dates newest first', async () => {
  state.historyNews = [
    { editionDate: '01/10/2026' },
    { editionDate: '06/10/2026' },
    { editionDate: '01/10/2026' }
  ];
  const response = createResponse();

  await newsHandler(createRequest({ query: { history: 'true' } }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, [
    { date: '06/10/2026', stories: 1, title: 'Edição de 06/10/2026' },
    { date: '01/10/2026', stories: 2, title: 'Edição de 01/10/2026' }
  ]);
});

test('news edition sorts headline stories before other stories', async () => {
  state.latestNews = [
    { _id: 'a', headline: false, publishedAt: '05/10/2026' },
    { _id: 'b', headline: true, publishedAt: '01/10/2026' },
    { _id: 'c', headline: false, publishedAt: '06/10/2026' }
  ];
  const response = createResponse();

  await newsHandler(createRequest({ query: { date: '06/10/2026' } }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.stories.map(story => story._id), ['b', 'c', 'a']);
});

test('news publishing requires authorization', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ method: 'POST' }), response);

  assert.equal(response.statusCode, 401);
  assert.equal(state.bulkWriteCalls.length, 0);
});

test('news publishing rejects invalid dates and empty editions', async () => {
  for (const body of [
    { date: '31/02/2026', stories: [{}] },
    { date: '06/10/2026', stories: [] }
  ]) {
    const response = createResponse();
    await newsHandler(createRequest({
      method: 'POST',
      headers: { authorization: 'Bearer test-notify-secret' },
      body
    }), response);

    assert.equal(response.statusCode, 400);
    assert.equal(state.bulkWriteCalls.length, 0);
  }
});

test('news publishing normalizes valid stories without sending notifications', async () => {
  state.bulkWriteResult = { upsertedCount: 1, modifiedCount: 0 };
  const response = createResponse();

  await newsHandler(createRequest({
    method: 'POST',
    headers: { authorization: 'Bearer test-notify-secret' },
    body: {
      date: ' 06/10/2026 ',
      stories: [{
        category: ' Política ',
        title: ' Notícia ',
        summary: ' Resumo ',
        context: ' Contexto ',
        source: ' Fonte ',
        publishedAt: '06/10/2026',
        url: ' https://example.com/story ',
        headline: true
      }]
    }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.inserted, 1);
  assert.equal(state.bulkWriteCalls.length, 1);
  assert.equal(state.bulkWriteCalls[0][0][0].updateOne.filter.url, 'https://example.com/story');
  assert.equal(state.bulkWriteCalls[0][0][0].updateOne.update.$set.title, 'Notícia');
  assert.equal(response.body.notification, null);
  assert.equal(state.notificationCalls, 0);
});

test('subscription endpoint stops requests when the distributed rate limit is exceeded', async () => {
  state.rateLimitBlocked = true;
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    headers: { 'x-real-ip': '203.0.113.10' },
    body: { email: 'reader@example.com' }
  }), response);

  assert.equal(response.statusCode, 429);
  assert.equal(response.headers['Retry-After'], '60');
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(state.databaseCalls, 0);
  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.rateLimitCalls.length, 1);
  assert.deepEqual(state.rateLimitCalls[0].map(check => check.scope), ['subscribe:ip', 'subscribe:email']);
});

test('subscription endpoint rejects unsupported methods and invalid email addresses', async () => {
  const wrongMethodResponse = createResponse();
  await subscribeHandler(createRequest({ method: 'GET' }), wrongMethodResponse);
  assert.equal(wrongMethodResponse.statusCode, 405);
  assert.equal(wrongMethodResponse.headers.Allow, 'POST');

  for (const email of ['not-an-email', 'missing-domain@', '']) {
    const response = createResponse();
    await subscribeHandler(createRequest({ method: 'POST', body: { email } }), response);
    assert.equal(response.statusCode, 400);
    assert.equal(state.databaseCalls, 0);
  }
});

test('subscription endpoint reports when the address is already confirmed', async () => {
  state.findSubscriber = { confirmed: true };
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    body: { email: 'reader@example.com' }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body.message, /Se este endereço puder receber/);
  assert.equal(state.sentEmails.length, 0);
});

test('subscription endpoint reports email delivery failures', async t => {
  t.mock.method(console, 'error', () => {});
  state.emailError = new Error('SMTP unavailable');
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    body: { email: 'reader@example.com' }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body.message, /Se este endereço puder receber/);
  assert.equal(state.savedSubscribers.length, 1);
  assert.equal(state.savedSubscribers[0].confirmationTokenHash, null);
  assert.equal(state.savedSubscribers[0].confirmationTokenExpiresAt, null);
  assert.equal(state.sentEmails.length, 0);
});

test('subscription endpoint normalizes address, stores hashed tokens, and sends confirmation', async () => {
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: { email: '  Reader@Example.com  ' }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(state.savedSubscribers.length, 1);
  assert.equal(state.savedSubscribers[0].email, 'reader@example.com');
  assert.equal(state.savedSubscribers[0].confirmed, false);
  assert.match(state.savedSubscribers[0].confirmationTokenHash, /^[a-f0-9]{64}$/);
  assert.match(state.savedSubscribers[0].unsubscribeTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(state.sentEmails[0].to, 'reader@example.com');
  assert.match(state.sentEmails[0].text, /^Confirme sua inscrição/);
});

test('subscription endpoint resends a fresh token for a pending subscription with an expired link', async () => {
  const oldExpiry = new Date(Date.now() - 60_000);
  const oldHash = hashToken('old-confirmation-token');
  const subscriber = {
    email: 'reader@example.com',
    confirmed: false,
    confirmationTokenHash: oldHash,
    confirmationTokenExpiresAt: oldExpiry,
    confirmationEmailSentAt: new Date(Date.now() - 120_000),
    unsubscribeTokenHash: hashToken('unsubscribe-token'),
    saveCalls: 0,
    async save() { this.saveCalls += 1; }
  };
  state.findSubscriber = subscriber;
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: { email: 'reader@example.com' }
  }), response);

  const tokenMatch = state.sentEmails[0].text.match(/token=([a-f0-9]{64})/);
  assert.equal(response.statusCode, 200);
  assert.ok(tokenMatch);
  assert.notEqual(subscriber.confirmationTokenHash, oldHash);
  assert.equal(subscriber.confirmationTokenHash, hashToken(tokenMatch[1]));
  assert.ok(subscriber.confirmationTokenExpiresAt.getTime() > Date.now());
  assert.equal(subscriber.saveCalls, 1);
  assert.equal(state.sentEmails.length, 1);
});

test('subscription endpoint applies a persistent cooldown to confirmation emails', async () => {
  const oldHash = hashToken('existing-token');
  state.findSubscriber = {
    email: 'reader@example.com',
    confirmed: false,
    confirmationTokenHash: oldHash,
    confirmationTokenExpiresAt: new Date(Date.now() + 60_000),
    confirmationEmailSentAt: new Date(),
    save: async () => assert.fail('Cooldown should not mutate the subscriber')
  };
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    body: { email: 'reader@example.com' }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body.message, /Se este endereço puder receber/);
  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.findSubscriber.confirmationTokenHash, oldHash);
});

test('subscription endpoint restores a previously valid token when resend delivery fails', async t => {
  t.mock.method(console, 'error', () => {});
  state.emailError = new Error('SMTP unavailable');
  const oldExpiry = new Date(Date.now() + 60_000);
  const oldSentAt = new Date(Date.now() - 120_000);
  const oldHash = hashToken('previous-valid-token');
  const subscriber = {
    email: 'reader@example.com',
    confirmed: false,
    confirmationTokenHash: oldHash,
    confirmationTokenExpiresAt: oldExpiry,
    confirmationEmailSentAt: oldSentAt,
    unsubscribeTokenHash: hashToken('unsubscribe-token'),
    saveCalls: 0,
    async save() { this.saveCalls += 1; }
  };
  state.findSubscriber = subscriber;
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    body: { email: 'reader@example.com' }
  }), response);

  assert.equal(response.statusCode, 200);
  assert.equal(subscriber.confirmationTokenHash, oldHash);
  assert.equal(subscriber.confirmationTokenExpiresAt, oldExpiry);
  assert.equal(subscriber.confirmationEmailSentAt, oldSentAt);
  assert.equal(subscriber.saveCalls, 2);
  assert.equal(state.sentEmails.length, 0);
});

test('confirmation endpoint rejects a missing token without connecting to MongoDB', async () => {
  const response = createResponse();

  await confirmHandler(createRequest(), response);

  assert.equal(response.redirectTo, '/subscription-status?status=invalid');
  assert.equal(state.databaseCalls, 0);
});

test('confirmation endpoint activates a subscriber and clears the confirmation token', async () => {
  const subscriber = {
    confirmed: false,
    confirmationTokenHash: 'hashed-token',
    confirmationTokenExpiresAt: new Date(Date.now() + 60_000),
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    }
  };
  state.findSubscriber = subscriber;
  const response = createResponse();

  await confirmHandler(createRequest({
    query: { token: 'valid-token' }
  }), response);

  assert.equal(response.redirectTo, '/subscription-status?status=confirmed');
  assert.equal(subscriber.confirmed, true);
  assert.equal(subscriber.confirmationTokenHash, null);
  assert.equal(subscriber.confirmationTokenExpiresAt, null);
  assert.equal(subscriber.saveCalls, 1);
  assert.equal(state.subscriberQueries[0].confirmationTokenHash, hashToken('valid-token'));
});

test('unsubscribe endpoint rejects missing and unknown tokens', async () => {
  const missingTokenResponse = createResponse();
  await unsubscribeHandler(createRequest(), missingTokenResponse);
  assert.equal(missingTokenResponse.redirectTo, '/subscription-status?status=invalid');
  assert.equal(state.databaseCalls, 0);

  const unknownTokenResponse = createResponse();
  await unsubscribeHandler(createRequest({
    query: { token: 'unknown-token', confirm: '1' }
  }), unknownTokenResponse);
  assert.equal(unknownTokenResponse.redirectTo, '/subscription-status?status=invalid');
  assert.equal(state.findSubscriber, null);
});

test('unsubscribe endpoint asks for confirmation before changing a subscription', async () => {
  state.findSubscriber = {
    confirmed: true,
    save: async () => assert.fail('Unsubscribe should require a second confirmation')
  };
  const response = createResponse();
  const token = 'unsubscribe/token';

  await unsubscribeHandler(createRequest({
    query: { token }
  }), response);

  assert.equal(
    response.redirectTo,
    '/subscription-status?status=unsubscribe-confirm&token=unsubscribe%2Ftoken'
  );
  assert.equal(state.findSubscriber.confirmed, true);
  assert.equal(state.subscriberQueries[0].$or[0].unsubscribeTokenHash, hashToken(token));
});

test('unsubscribe GET preview never mutates a subscription', async () => {
  state.findSubscriber = { confirmed: true, save: async () => assert.fail('GET must not mutate state') };
  const response = createResponse();
  await unsubscribeHandler(createRequest({ query: { token: 'unsubscribe-token', confirm: '1' } }), response);
  assert.equal(response.redirectTo, '/subscription-status?status=unsubscribe-confirm&token=unsubscribe-token');
  assert.equal(state.findSubscriber.confirmed, true);
});

test('unsubscribe endpoint deactivates a confirmed subscription after confirmation', async () => {
  state.findSubscriber = {
    confirmed: true,
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    }
  };
  const response = createResponse();

  await unsubscribeHandler(createRequest({
    method: 'POST',
    body: { token: 'unsubscribe-token' }
  }), response);

  assert.equal(response.redirectTo, '/subscription-status?status=unsubscribed');
  assert.equal(state.findSubscriber.confirmed, false);
  assert.equal(state.findSubscriber.saveCalls, 1);
});

test('unsubscribe endpoint reports database failures without confirming cancellation', async t => {
  t.mock.method(console, 'error', () => {});
  state.databaseError = new Error('database unavailable');
  const response = createResponse();

  await unsubscribeHandler(createRequest({
    query: { token: 'unsubscribe-token', confirm: '1' }
  }), response);

  assert.equal(response.redirectTo, '/subscription-status?status=error');
  assert.equal(state.findSubscriber, null);
});
