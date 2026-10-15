const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  latestStories: [],
  subscribers: [],
  legacyDeliveredKeys: new Set(),
  deliveryRecords: new Map(),
  sentEmails: [],
  sendAttempts: [],
  sendErrors: {},
  emailResult: { accepted: ['reader@example.com'], rejected: [] }
};

function applyUpdate(record, update) {
  Object.assign(record, update.$set || {});
  for (const [key, amount] of Object.entries(update.$inc || {})) {
    record[key] = (record[key] || 0) + amount;
  }
}

const modules = {
  '../lib/db': {
    connectDatabase: async () => {}
  },
  '../lib/news': {
    find: query => query
      ? { lean: async () => state.latestStories.filter(story => story.editionDate === query.editionDate) }
      : { select: () => ({ lean: async () => state.latestStories.map(story => ({ editionDate: story.editionDate })) }) }
  },
  '../lib/subscriber': {
    find: () => ({ lean: async () => state.subscribers }),
    updateOne: async () => {}
  },
  '../lib/news-delivery': {
    find: query => ({
      select: () => ({
        lean: async () => [...state.legacyDeliveredKeys]
          .filter(newsKey => query.newsKey.$in.includes(newsKey))
          .map(newsKey => ({ newsKey }))
      })
    })
  },
  '../lib/recipient-news-delivery': {
    create: async record => {
      if (state.deliveryRecords.has(record.deliveryKey)) {
        throw Object.assign(new Error('duplicate key'), { code: 11000 });
      }
      state.deliveryRecords.set(record.deliveryKey, { ...record });
      return record;
    },
    findOne: query => ({
      lean: async () => {
        const record = state.deliveryRecords.get(query.deliveryKey);
        return record ? { ...record } : null;
      }
    }),
    updateOne: async (query, update) => {
      const record = state.deliveryRecords.get(query.deliveryKey);
      if (!record || (query.status && record.status !== query.status)) {
        return { modifiedCount: 0 };
      }
      if (query.startedAt && new Date(record.startedAt).getTime() !== new Date(query.startedAt).getTime()) {
        return { modifiedCount: 0 };
      }
      applyUpdate(record, update);
      return { modifiedCount: 1 };
    },
    updateMany: async (query, update) => {
      let modifiedCount = 0;
      for (const record of state.deliveryRecords.values()) {
        if (query.deliveryKey && !query.deliveryKey.$in.includes(record.deliveryKey)) continue;
        if (query.status && record.status !== query.status) continue;
        applyUpdate(record, update);
        modifiedCount += 1;
      }
      return { modifiedCount };
    }
  },
  '../lib/email': {
    sendEmail: async message => {
      state.sendAttempts.push(message.to);
      if (state.sendErrors[message.to]) throw state.sendErrors[message.to];
      state.sentEmails.push(message);
      return state.emailResult;
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

function makeStory(title, url = 'https://example.com/' + title.toLowerCase().replaceAll(' ', '-')) {
  return {
    _id: title,
    editionDate: '06/10/2026',
    category: 'Economia',
    title,
    summary: 'Resumo',
    context: 'Contexto',
    url,
    publishedAt: '06/10/2026'
  };
}

function makeSubscriber(id, email) {
  return {
    _id: id,
    email,
    confirmed: true,
    unsubscribeTokenHash: 'unsubscribe-hash-' + id
  };
}

function getRecordFor(title, subscriberId) {
  const crypto = require('node:crypto');
  const story = state.latestStories.find(item => item.title === title);
  const newsKey = story.url || story.editionDate + '|' + story.title;
  const deliveryKey = crypto.createHash('sha256')
    .update(String(story.editionDate) + '\u0000' + newsKey + '\u0000' + subscriberId)
    .digest('hex');
  return state.deliveryRecords.get(deliveryKey);
}

beforeEach(() => {
  state.latestStories = [makeStory('Notícia teste')];
  state.subscribers = [makeSubscriber('subscriber-1', 'reader@example.com')];
  state.legacyDeliveredKeys = new Set();
  state.deliveryRecords = new Map();
  state.sentEmails = [];
  state.sendAttempts = [];
  state.sendErrors = {};
  state.emailResult = { accepted: ['reader@example.com'], rejected: [] };
  process.env.APP_URL = 'http://localhost:3000';
  process.env.NOTIFY_SECRET = 'test-notify-secret';
});

test('notification delivery records each recipient and does not resend on retries', async () => {
  const request = { headers: { host: 'localhost:3000' } };

  const first = await notifyHandler.notifyLatestNews(request);
  const retry = await notifyHandler.notifyLatestNews(request);

  assert.deepEqual(first, {
    sent: true,
    editionDate: '06/10/2026',
    newStories: 1,
    recipients: 1
  });
  assert.deepEqual(retry, {
    sent: false,
    editionDate: '06/10/2026',
    newStories: 0,
    recipients: 0
  });
  assert.equal(state.sentEmails.length, 1);
  assert.equal(state.sendAttempts.length, 1);
  assert.equal(getRecordFor('Notícia teste', 'subscriber-1').status, 'sent');
});

test('a partial batch failure retries only the recipient that failed', async t => {
  t.mock.method(console, 'error', () => {});
  state.subscribers = [
    makeSubscriber('subscriber-1', 'first@example.com'),
    makeSubscriber('subscriber-2', 'second@example.com')
  ];
  state.sendErrors['second@example.com'] = Object.assign(new Error('SMTP rejected'), { code: 'EAUTH' });

  await assert.rejects(
    notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } }),
    error => error.code === 'EAUTH'
  );

  assert.equal(getRecordFor('Notícia teste', 'subscriber-1').status, 'sent');
  assert.equal(getRecordFor('Notícia teste', 'subscriber-2').status, 'failed');
  assert.equal(state.sentEmails.length, 1);

  delete state.sendErrors['second@example.com'];
  const retry = await notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } });

  assert.equal(retry.sent, true);
  assert.equal(state.sentEmails.length, 2);
  assert.deepEqual(state.sendAttempts, [
    'first@example.com',
    'second@example.com',
    'second@example.com'
  ]);
  assert.equal(getRecordFor('Notícia teste', 'subscriber-1').status, 'sent');
  assert.equal(getRecordFor('Notícia teste', 'subscriber-2').status, 'sent');
});

test('ambiguous SMTP timeout is quarantined and is not resent automatically', async t => {
  t.mock.method(console, 'error', () => {});
  state.sendErrors['reader@example.com'] = Object.assign(new Error('SMTP timeout'), { code: 'ETIMEDOUT' });

  await assert.rejects(
    notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } }),
    error => error.code === 'ETIMEDOUT'
  );

  assert.equal(getRecordFor('Notícia teste', 'subscriber-1').status, 'unknown');

  const retry = await notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } });
  assert.equal(retry.sent, false);
  assert.equal(state.sendAttempts.length, 1);
});

test('new stories added to the same edition do not resend stories already delivered', async () => {
  const request = { headers: { host: 'localhost:3000' } };
  await notifyHandler.notifyLatestNews(request);
  state.latestStories.push(makeStory('Nova notícia', 'https://example.com/new-story'));

  const result = await notifyHandler.notifyLatestNews(request);

  assert.equal(result.sent, true);
  assert.equal(result.newStories, 1);
  assert.equal(state.sentEmails.length, 2);
  assert.match(state.sentEmails[1].text, /Nova notícia/);
  assert.doesNotMatch(state.sentEmails[1].text, /Notícia teste/);
});


test('the same source can be delivered again in a different edition', async () => {
  const request = { headers: { host: 'localhost:3000' } };
  await notifyHandler.notifyLatestNews(request);
  state.latestStories.push({
    ...makeStory('Notícia teste'),
    editionDate: '07/10/2026'
  });

  const result = await notifyHandler.notifyLatestNews(request);

  assert.equal(result.sent, true);
  assert.equal(result.editionDate, '07/10/2026');
  assert.equal(state.sentEmails.length, 2);
  assert.equal(state.deliveryRecords.size, 2);
});

test('legacy story-level records prevent redelivery of previously completed stories', async () => {
  state.legacyDeliveredKeys.add('https://example.com/notícia-teste');
  const result = await notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } });

  assert.equal(result.sent, false);
  assert.equal(state.sendAttempts.length, 0);
  assert.equal(state.deliveryRecords.size, 0);
});

test('newsletter records only SMTP-accepted sends as recipients', async t => {
  t.mock.method(console, 'error', () => {});
  state.emailResult = { accepted: [], rejected: ['reader@example.com'] };

  await assert.rejects(
    notifyHandler.notifyLatestNews({ headers: { host: 'localhost:3000' } }),
    error => error.code === 'SMTP_NO_ACCEPTED_RECIPIENTS'
  );

  assert.equal(state.sentEmails.length, 1);
  assert.equal(getRecordFor('Notícia teste', 'subscriber-1').status, 'failed');
});

test('notification endpoint requires authorization for POST requests', async () => {
  const response = {
    statusCode: null,
    body: null,
    setHeader() {},
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
