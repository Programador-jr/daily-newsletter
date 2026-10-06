const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  latestStories: [],
  subscribers: [],
  deliveredKeys: new Set(),
  sentEmails: [],
  insertedKeys: [],
  sendError: null
};

const modules = {
  '../lib/db': {
    connectDatabase: async () => {}
  },
  '../lib/news': {
    find: query => query
      ? { lean: async () => state.latestStories }
      : { select: () => ({ lean: async () => state.latestStories.map(story => ({ editionDate: story.editionDate })) }) }
  },
  '../lib/subscriber': {
    find: () => ({ lean: async () => state.subscribers }),
    updateOne: async () => {}
  },
  '../lib/news-delivery': {
    find: query => ({
      select: () => ({
        lean: async () => [...state.deliveredKeys]
          .filter(newsKey => query.newsKey.$in.includes(newsKey))
          .map(newsKey => ({ newsKey }))
      })
    }),
    insertMany: async records => {
      for (const record of records) {
        state.deliveredKeys.add(record.newsKey);
        state.insertedKeys.push(record.newsKey);
      }
    }
  },
  '../lib/email': {
    sendEmail: async message => {
      if (state.sendError) throw state.sendError;
      state.sentEmails.push(message);
    }
  },
  '../lib/tokens': require('../lib/tokens')
};

const originalModules = new Map();
for (const [modulePath, exports] of Object.entries(modules)) {
  const resolvedPath = require.resolve(modulePath);
  originalModules.set(resolvedPath, require.cache[resolvedPath]);
  require.cache[resolvedPath] = { id: resolvedPath, filename: resolvedPath, loaded: true, exports };
}

const notifyHandler = require('../api/notify-news');

for (const [resolvedPath, originalModule] of originalModules) {
  if (originalModule) {
    require.cache[resolvedPath] = originalModule;
  } else {
    delete require.cache[resolvedPath];
  }
}

beforeEach(() => {
  state.latestStories = [{
    editionDate: '06/10/2026',
    category: 'Economia',
    title: 'Notícia teste',
    summary: 'Resumo',
    context: 'Contexto',
    url: 'https://example.com/news',
    publishedAt: '06/10/2026'
  }];
  state.subscribers = [{
    _id: 'subscriber-1',
    email: 'reader@example.com',
    confirmed: true,
    unsubscribeTokenHash: 'unsubscribe-hash'
  }];
  state.deliveredKeys = new Set();
  state.sentEmails = [];
  state.insertedKeys = [];
  state.sendError = null;
  process.env.APP_URL = 'http://localhost:3000';
  process.env.NOTIFY_SECRET = 'test-notify-secret';
});

test('notification delivery records a story and does not resend it on retries', async () => {
  const request = { headers: { host: 'localhost:3000' } };

  const first = await notifyHandler.notifyLatestNews(request);
  const retry = await notifyHandler.notifyLatestNews(request);

  assert.deepEqual(first, {
    sent: true,
    editionDate: '06/10/2026',
    newStories: 1,
    recipients: 1
  });
  assert.deepEqual(retry, { sent: false, newStories: 0, recipients: 0 });
  assert.equal(state.sentEmails.length, 1);
  assert.equal(state.insertedKeys.length, 1);
});

test('notification failure propagates and does not mark stories delivered', async t => {
  t.mock.method(console, 'error', () => {});
  state.sendError = Object.assign(new Error('SMTP unavailable'), { code: 'ECONNECTION' });

  await assert.rejects(
    notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } }),
    error => error === state.sendError
  );

  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.insertedKeys.length, 0);
  assert.equal(state.deliveredKeys.size, 0);
});

test('notification endpoint requires authorization for POST requests', async () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  await notifyHandler({
    method: 'POST',
    headers: { authorization: 'Bearer incorrect-secret' }
  }, response);

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { error: 'Não autorizado.' });
});
