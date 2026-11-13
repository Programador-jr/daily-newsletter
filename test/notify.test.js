const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  digests: [],
  subscribers: [],
  deliveryRecords: new Map(),
  schedule: { enabled: true, digestSendTime: null },
  sentEmails: [],
  sendErrors: {}
};

function matches(record, query) {
  return Object.entries(query).every(([key, condition]) => {
    const value = key === '_id' ? String(record._id) : record[key];
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('$in' in condition) return condition.$in.includes(value);
      if ('$ne' in condition) return String(value) !== String(condition.$ne);
    }
    return key === '_id' ? value === String(condition) : value === condition;
  });
}

function applySet(record, update) {
  for (const [key, value] of Object.entries(update.$set || {})) {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      record[parent] = { ...(record[parent] || {}), [child]: value };
    } else {
      record[key] = value;
    }
  }
  for (const [key, amount] of Object.entries(update.$inc || {})) record[key] = (record[key] || 0) + amount;
}

function updateOneIn(collection, query, update) {
  const record = collection.find(item => matches(item, query));
  if (!record) return { modifiedCount: 0 };
  applySet(record, update);
  return { modifiedCount: 1 };
}

const modules = {
  '../lib/daily-digest': {
    find: query => ({
      sort: () => ({ lean: async () => state.digests.filter(item => matches(item, query)).map(item => ({ ...item })) })
    }),
    updateOne: async (query, update) => updateOneIn(state.digests, query, update),
    updateMany: async (query, update) => {
      const records = state.digests.filter(item => matches(item, query));
      for (const record of records) applySet(record, update);
      return { modifiedCount: records.length };
    }
  },
  '../lib/subscriber': {
    find: () => ({ lean: async () => state.subscribers }),
    updateOne: async () => {}
  },
  '../lib/recipient-news-delivery': {
    create: async record => {
      if (state.deliveryRecords.has(record.deliveryKey)) throw Object.assign(new Error('duplicate key'), { code: 11000 });
      state.deliveryRecords.set(record.deliveryKey, { ...record });
      return record;
    },
    findOne: query => ({ lean: async () => {
      const record = state.deliveryRecords.get(query.deliveryKey);
      return record ? { ...record } : null;
    } }),
    updateOne: async (query, update) => {
      const record = state.deliveryRecords.get(query.deliveryKey);
      if (!record || (query.status && record.status !== query.status)) return { modifiedCount: 0 };
      if (query.startedAt && new Date(record.startedAt).getTime() !== new Date(query.startedAt).getTime()) return { modifiedCount: 0 };
      applySet(record, update);
      return { modifiedCount: 1 };
    },
    countDocuments: async query => [...state.deliveryRecords.values()].filter(record => matches(record, query)).length
  },
  '../lib/email': {
    sendEmail: async message => {
      if (state.sendErrors[message.to]) throw state.sendErrors[message.to];
      state.sentEmails.push(message);
      return { accepted: [message.to], rejected: [] };
    }
  },
  '../lib/worker-schedule': {
    getWorkerSchedule: async () => ({ ...state.schedule })
  },
  '../lib/newsletter-settings': {
    ...require('../lib/newsletter-settings'),
    getEmailBanner: async () => ({ ...state.banner })
  }
};

const originals = new Map();
for (const [modulePath, exports] of Object.entries(modules)) {
  const resolved = require.resolve(modulePath);
  originals.set(resolved, require.cache[resolved]);
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
}
const senderPath = require.resolve('../lib/digest-sender');
delete require.cache[senderPath];
const { sendApprovedDigests, sendScheduledDigests, digestDeliveryKey } = require('../lib/digest-sender');
for (const [resolved, original] of originals) {
  if (original) require.cache[resolved] = original;
  else delete require.cache[resolved];
}
delete require.cache[senderPath];

const { renderDigestEmail } = require('../lib/digest-email');
const { nextDigestSendAt, isDigestDue, digestDateKey } = require('../lib/digest-schedule');

function makeDigest(overrides = {}) {
  return {
    _id: 'digest-1',
    editionDate: '2026-11-09',
    timezone: 'America/Rio_Branco',
    status: 'draft',
    subject: "King's Newsletter | Resumo — 09/11/2026",
    preheader: 'COP31 e mercado de carbono',
    headline: 'COP31 começa',
    stories: [
      { editorialRank: 2, category: 'Economia', title: 'Segunda notícia', summary: 'Resumo 2', context: 'Contexto 2', source: 'UOL', articleUrl: 'https://example.com/2' },
      { editorialRank: 1, category: 'Clima', title: 'COP31 começa <hoje>', summary: 'Resumo 1', context: 'Contexto 1', source: 'Reuters', articleUrl: 'https://example.com/1' }
    ],
    delivery: { sentCount: 0, failedCount: 0 },
    ...overrides
  };
}

function subscriber(id, email) {
  return { _id: id, email, confirmed: true, unsubscribeTokenHash: 'hash-' + id };
}

// 09/11/2026 21:00 in Rio Branco (UTC-5).
const EVENING = new Date('2026-11-10T02:00:00.000Z');
// 09/11/2026 10:00 in Rio Branco.
const MORNING = new Date('2026-11-09T15:00:00.000Z');

beforeEach(() => {
  state.digests = [makeDigest()];
  state.subscribers = [subscriber('s1', 'one@example.com'), subscriber('s2', 'two@example.com')];
  state.deliveryRecords = new Map();
  state.schedule = { enabled: true, digestSendTime: '20:00' };
  state.sentEmails = [];
  state.sendErrors = {};
  state.banner = { url: 'https://cdn.example.com/banner-admin.png', alt: 'Banner escolhido no admin', source: 'upload' };
  process.env.APP_URL = 'http://localhost:3000';
});

test('drafts are never sent while no daily send time is configured', async () => {
  state.schedule.digestSendTime = null;
  const result = await sendScheduledDigests(EVENING);
  assert.equal(result.sent, false);
  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.digests[0].status, 'draft');
});

test("today's draft is not sent before the configured time", async () => {
  await sendScheduledDigests(MORNING);
  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.digests[0].status, 'draft');
});

test('a paused schedule does not auto-send the draft', async () => {
  state.schedule.enabled = false;
  await sendScheduledDigests(EVENING);
  assert.equal(state.sentEmails.length, 0);
});

test("after the send time, today's draft goes out once per subscriber and retries do not resend", async () => {
  const first = await sendScheduledDigests(EVENING);
  assert.deepEqual({ sent: first.sent, recipients: first.recipients, failed: first.failedRecipients, stories: first.newStories, date: first.editionDate },
    { sent: true, recipients: 2, failed: 0, stories: 2, date: '09/11/2026' });
  assert.equal(state.digests[0].status, 'sent');
  assert.equal(state.digests[0].approvedBy, 'schedule');
  assert.equal(state.digests[0].delivery.sentCount, 2);
  assert.deepEqual(state.sentEmails.map(email => email.to).sort(), ['one@example.com', 'two@example.com']);

  state.digests[0].status = 'approved';
  const retry = await sendScheduledDigests(EVENING);
  assert.equal(retry.recipients, 0);
  assert.equal(state.sentEmails.length, 2);
});

test("drafts from earlier days are not auto-sent", async () => {
  state.digests = [makeDigest({ editionDate: '2026-11-08' })];
  await sendScheduledDigests(EVENING);
  assert.equal(state.sentEmails.length, 0);
  assert.equal(state.digests[0].status, 'draft');
});

test('a manually approved digest is sent regardless of the time of day', async () => {
  state.schedule.digestSendTime = null;
  state.digests[0].status = 'approved';
  const result = await sendApprovedDigests();
  assert.equal(result.recipients, 2);
  assert.equal(state.digests[0].status, 'sent');
});

test('a partial failure marks the digest failed and a new approval retries only that recipient', async () => {
  state.digests[0].status = 'approved';
  state.sendErrors['two@example.com'] = Object.assign(new Error('rejected'), { code: 'EENVELOPE' });
  const first = await sendApprovedDigests();
  assert.equal(first.recipients, 1);
  assert.equal(first.failedRecipients, 1);
  assert.equal(state.digests[0].status, 'failed');
  assert.equal(state.digests[0].delivery.failedCount, 1);

  delete state.sendErrors['two@example.com'];
  state.digests[0].status = 'approved';
  const retry = await sendApprovedDigests();
  assert.equal(retry.recipients, 1);
  assert.deepEqual(state.sentEmails.map(email => email.to), ['one@example.com', 'two@example.com']);
  assert.equal(state.digests[0].status, 'sent');
  assert.equal(state.digests[0].delivery.sentCount, 2);
});

test('an ambiguous SMTP timeout is quarantined and never resent automatically', async () => {
  state.subscribers = [subscriber('s1', 'one@example.com')];
  state.digests[0].status = 'approved';
  state.sendErrors['one@example.com'] = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
  await sendApprovedDigests();
  const record = state.deliveryRecords.get(digestDeliveryKey(state.digests[0], 's1'));
  assert.equal(record.status, 'unknown');

  delete state.sendErrors['one@example.com'];
  state.digests[0].status = 'approved';
  const retry = await sendApprovedDigests();
  assert.equal(retry.recipients, 0);
  assert.equal(state.sentEmails.length, 0);
});

test('a second digest for the same date does not reach the same subscriber twice', async () => {
  state.digests[0].status = 'approved';
  await sendApprovedDigests();
  state.digests.push(makeDigest({ _id: 'digest-2', status: 'approved' }));
  const second = await sendApprovedDigests();
  assert.equal(second.recipients, 0);
  assert.equal(state.sentEmails.length, 2);
});

test('subscriber emails carry their own unsubscribe link, ordered stories and escaped text', async () => {
  state.subscribers = [subscriber('s1', 'one@example.com')];
  state.digests[0].status = 'approved';
  await sendApprovedDigests();
  const [email] = state.sentEmails;
  assert.equal(email.subject, "King's Newsletter | Resumo — 09/11/2026");
  assert.match(email.html, /\/api\/unsubscribe\?token=hash-s1/);
  assert.match(email.text, /Cancelar inscrição: http:\/\/localhost:3000\/api\/unsubscribe\?token=hash-s1/);
  assert.match(email.html, /COP31 e mercado de carbono/);
  assert.match(email.html, /COP31 começa &lt;hoje&gt;/);
  assert.ok(email.html.indexOf('COP31 começa') < email.html.indexOf('Segunda notícia'), 'stories follow editorialRank');
  assert.ok(email.text.startsWith("KING'S NEWSLETTER — EDIÇÃO DIÁRIA 09/11/2026"));
});

test('test and preview renders say they were not sent and drop unsafe links', () => {
  const digest = makeDigest({ stories: [{ title: 'Link ruim', articleUrl: 'javascript:alert(1)' }] });
  const test = renderDigestEmail(digest, { appUrl: 'http://localhost:3000', mode: 'test' });
  assert.match(test.subject, /^\[TESTE\] /);
  assert.match(test.html, /não enviada aos assinantes/);
  assert.doesNotMatch(test.html, /javascript:/);
  assert.doesNotMatch(test.html, /Cancelar inscrição/);
});

test('send time helpers use the Rio Branco calendar day', () => {
  assert.equal(digestDateKey(EVENING), '2026-11-09');
  assert.equal(isDigestDue('20:00', EVENING), true);
  assert.equal(isDigestDue('20:00', MORNING), false);
  assert.equal(isDigestDue(null, EVENING), false);
  assert.equal(nextDigestSendAt('20:00', MORNING).toISOString(), '2026-11-10T01:00:00.000Z');
  assert.equal(nextDigestSendAt('20:00', EVENING).toISOString(), '2026-11-11T01:00:00.000Z');
  assert.equal(nextDigestSendAt('25:00', MORNING), null);
});

test('subscriber emails show the linked news image, category pill and watch-next list', async () => {
  state.subscribers = [subscriber('s1', 'one@example.com')];
  state.digests = [makeDigest({
    status: 'approved',
    watchNext: ['Negociações entre EUA e Irã', 'Primeiros dias da COP31'],
    stories: [
      { newsId: 'n1', editorialRank: 1, category: 'Segurança Internacional', title: 'Conflito no Estreito de Ormuz', summary: 'Primeiro.\n\nSegundo.', context: 'Por que importa?\n\nImporta.', source: 'Reuters', articleUrl: 'https://example.com/ormuz', image: { url: 'https://images.example.com/ormuz.jpg', alt: 'Navios no estreito', attribution: 'Fotógrafo X' } },
      { newsId: 'n2', editorialRank: 2, category: 'Brasil', title: 'Sem imagem de propósito', summary: 'Texto.' }
    ]
  })];
  await sendApprovedDigests();
  const [email] = state.sentEmails;
  assert.match(email.html, /<img src="https:\/\/images\.example\.com\/ormuz\.jpg" alt="Navios no estreito"/);
  assert.doesNotMatch(email.html, /Fotógrafo X/, 'image credit is not shown');
  assert.match(email.html, /#fde8e7/, 'security stories use the red pill');
  assert.match(email.html, /<p[^>]*>Primeiro\.<\/p><p[^>]*>Segundo\.<\/p>/);
  assert.equal((email.html.match(/Por que importa\?/g) || []).length, 1, 'the heading already in the text is not repeated');
  assert.equal((email.html.match(/<img /g) || []).length, 2, 'banner plus only the story that defines an image');
  assert.match(email.html, /O que acompanhar amanhã\?/);
  assert.match(email.html, /<li>Primeiros dias da COP31<\/li>/);
  assert.match(email.html, /A notícia não termina aqui\./);
  assert.match(email.text, /- Negociações entre EUA e Irã/);
});

test('images that are not https are dropped', () => {
  const digest = makeDigest({ stories: [{ title: 'Sem imagem segura', image: { url: 'http://insecure.example.com/a.jpg' } }] });
  assert.doesNotMatch(renderDigestEmail(digest).html, /insecure\.example\.com/);
});

test('digests dated DD/MM/YYYY, like news, are auto-sent and deduplicated by calendar day', async () => {
  state.digests = [makeDigest({ editionDate: '09/11/2026' })];
  const first = await sendScheduledDigests(EVENING);
  assert.equal(first.recipients, 2);
  assert.equal(first.editionDate, '09/11/2026');
  state.digests.push(makeDigest({ _id: 'digest-iso', editionDate: '2026-11-09', status: 'approved' }));
  const second = await sendApprovedDigests();
  assert.equal(second.recipients, 0, 'same day in the other format does not resend');
  assert.match(state.sentEmails[0].html, /Edição diária · 09\/11\/2026/i);
});

test('a context that opens with its own question uses it as the section heading', () => {
  const digest = makeDigest({ stories: [{ title: 'Temporais no Acre', context: 'O que merece atenção?\n\nA previsão não indica danos.' }] });
  const { html, text } = renderDigestEmail(digest);
  assert.match(html, />O que merece atenção\?<\/p>/);
  assert.doesNotMatch(html, /Por que importa\?/);
  assert.match(text, /O que merece atenção\? A previsão não indica danos\./);
});

test('a story contextLabel names the context section in html and text', () => {
  const digest = makeDigest({ stories: [{ title: 'Apostas e violência', context: 'A conta chega a quem nem apostou.', contextLabel: ' Quem paga a conta ' }] });
  const { html, text } = renderDigestEmail(digest);
  assert.match(html, />Quem paga a conta<\/p>/);
  assert.doesNotMatch(html, /Além da manchete|Por que importa\?/);
  assert.match(text, /Quem paga a conta: A conta chega a quem nem apostou\./);
});

test('contextLabel wins over an opening question, which is not repeated', () => {
  const digest = makeDigest({ stories: [{ title: 'Orçamento', context: 'Por que importa?\n\nDívida continua sendo dívida.', contextLabel: 'Faça as contas' }] });
  const { html } = renderDigestEmail(digest);
  assert.match(html, />Faça as contas<\/p>/);
  assert.doesNotMatch(html, /Por que importa\?/);
});

test('without a label or opening question the context uses the default heading', () => {
  const tooLong = 'x'.repeat(81);
  const digest = makeDigest({ stories: [{ title: 'Sem rótulo', context: 'Texto.', contextLabel: tooLong }] });
  const { html, text } = renderDigestEmail(digest);
  assert.match(html, />Além da manchete<\/p>/);
  assert.doesNotMatch(html, new RegExp(tooLong));
  assert.match(text, /Além da manchete: Texto\./);
});

test('subscriber emails use the banner chosen in the admin and carry no signature', async () => {
  state.subscribers = [subscriber('s1', 'one@example.com')];
  state.digests[0].status = 'approved';
  await sendApprovedDigests();
  const [email] = state.sentEmails;
  assert.match(email.html, /<img src="https:\/\/cdn\.example\.com\/banner-admin\.png" alt="Banner escolhido no admin"/);
  assert.doesNotMatch(email.html, /Feito com caf/);
  assert.doesNotMatch(email.text, /Feito com caf/);
});

test('a non-https banner falls back to the default one', () => {
  const { DEFAULT_BANNER_URL } = require('../lib/newsletter-settings');
  const { html } = renderDigestEmail(makeDigest(), { banner: { url: 'http://insecure.example.com/b.png' } });
  assert.doesNotMatch(html, /insecure\.example\.com/);
  assert.ok(html.includes(DEFAULT_BANNER_URL));
});
