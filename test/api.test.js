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
  historyNews: []
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
      state.savedSubscribers.push(this);
    }
  },
  '../lib/tokens': require('../lib/tokens'),
  '../lib/email': {
    sendEmail: async message => {
      if (state.emailError) throw state.emailError;
      state.sentEmails.push(message);
    }
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

test('news publishing normalizes valid stories and notifies after inserting new ones', async () => {
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
  assert.equal(state.notificationCalls, 1);
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

  assert.equal(response.statusCode, 409);
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

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.error, 'Não foi possível concluir a inscrição agora.');
  assert.equal(state.savedSubscribers.length, 1);
});

test('subscription endpoint normalizes address, stores hashed tokens, and sends confirmation', async () => {
  const response = createResponse();

  await subscribeHandler(createRequest({
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: { email: '  Reader@Example.com  ' }
  }), response);

  assert.equal(response.statusCode, 201);
  assert.equal(state.savedSubscribers.length, 1);
  assert.equal(state.savedSubscribers[0].email, 'reader@example.com');
  assert.equal(state.savedSubscribers[0].confirmed, false);
  assert.match(state.savedSubscribers[0].confirmationTokenHash, /^[a-f0-9]{64}$/);
  assert.match(state.savedSubscribers[0].unsubscribeTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(state.sentEmails[0].to, 'reader@example.com');
  assert.match(state.sentEmails[0].text, /^Confirme sua inscrição/);
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
    query: { token: 'unsubscribe-token', confirm: '1' }
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
