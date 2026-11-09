const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  databaseCalls: 0,
  databaseError: null,
  editions: [],
  selectedEdition: null,
  findCalls: [],
  findOneCalls: [],
  selectCalls: [],
  findOneSorts: []
};

const modules = {
  '../lib/db': {
    connectDatabase: async () => {
      state.databaseCalls += 1;
      if (state.databaseError) throw state.databaseError;
    }
  },
  '../lib/weekly-edition': {
    find: query => {
      state.findCalls.push(query);
      const chain = {
        select: fields => {
          state.selectCalls.push(fields);
          return chain;
        },
        sort: () => chain,
        limit: () => chain,
        lean: async () => state.editions
      };
      return chain;
    },
    findOne: query => {
      state.findOneCalls.push(query);
      const chain = {
        sort: order => {
          state.findOneSorts.push(order);
          return chain;
        },
        lean: async () => state.selectedEdition
      };
      return chain;
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

const handler = require('../api/weekly-editions');

for (const [resolvedPath, originalModule] of originalModules) {
  if (originalModule) require.cache[resolvedPath] = originalModule;
  else delete require.cache[resolvedPath];
}

function createResponse() {
  return {
    statusCode: null,
    headers: {},
    body: null,
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
    }
  };
}

function createRequest(overrides = {}) {
  return { method: 'GET', query: {}, ...overrides };
}

function storedEdition(overrides = {}) {
  return {
    _id: 'internal-id',
    __v: 0,
    slug: 'semana-01',
    editionNumber: 1,
    title: ' A semana em resumo ',
    subtitle: 'EDIÇÃO ESPECIAL',
    weekStart: new Date('2026-11-02T00:00:00.000Z'),
    weekEnd: new Date('2026-11-08T23:59:59.000Z'),
    publishedAt: new Date('2026-11-09T00:00:00.000Z'),
    intro: 'Abertura.',
    sections: [
      {
        title: '1. Política',
        intro: 'Intro da seção.',
        stories: [
          { title: 'Fato', summary: 'Resumo.', context: 'Contexto.', source: 'Reuters', url: 'https://example.com' },
          { title: 'Outro fato', summary: 'Resumo 2.' }
        ]
      },
      { title: '2. Economia', stories: [{ title: 'Juros' }] }
    ],
    analysis: 'Análise.',
    status: 'published',
    createdAt: new Date('2026-11-08T22:05:06.000Z'),
    updatedAt: '2026-11-09T00:10:00.000Z',
    ...overrides
  };
}

beforeEach(() => {
  state.databaseCalls = 0;
  state.databaseError = null;
  state.editions = [];
  state.selectedEdition = null;
  state.findCalls = [];
  state.findOneCalls = [];
  state.selectCalls = [];
  state.findOneSorts = [];
});

test('rejects unsupported methods without connecting to the database', async () => {
  const response = createResponse();
  await handler(createRequest({ method: 'POST' }), response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET');
  assert.equal(state.databaseCalls, 0);
});

test('rejects malformed slugs before querying MongoDB', async () => {
  const response = createResponse();
  await handler(createRequest({ query: { slug: '../private' } }), response);

  assert.equal(response.statusCode, 400);
  assert.equal(state.databaseCalls, 0);
});

test('serves the latest published edition with the editions archive', async () => {
  state.editions = [storedEdition()];
  state.selectedEdition = storedEdition();
  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(state.findCalls, [{ status: 'published' }]);
  assert.deepEqual(state.findOneCalls, [{ status: 'published' }]);
  assert.deepEqual(state.findOneSorts, [{ weekStart: -1, publishedAt: -1 }]);
  assert.equal(response.headers['Cache-Control'], 'public, s-maxage=300, stale-while-revalidate=600');

  assert.deepEqual(response.body.editions, [{
    slug: 'semana-01',
    editionNumber: 1,
    title: 'A semana em resumo',
    subtitle: 'EDIÇÃO ESPECIAL',
    weekStart: '2026-11-02T00:00:00.000Z',
    weekEnd: '2026-11-08T23:59:59.000Z',
    publishedAt: '2026-11-09T00:00:00.000Z',
    sectionCount: 2,
    storyCount: 3
  }]);
  assert.equal(response.body.edition.slug, 'semana-01');
});

test('serves the summary text as written, without internal fields', async () => {
  state.selectedEdition = storedEdition();
  const response = createResponse();
  await handler(createRequest({ query: { slug: 'SEMANA-01' } }), response);

  const { edition } = response.body;
  assert.equal(response.statusCode, 200);
  assert.deepEqual(state.findOneCalls, [{ slug: 'semana-01', status: 'published' }]);
  assert.equal(edition.sections[0].title, '1. Política');
  assert.equal(edition.sections[0].stories[0].context, 'Contexto.');
  assert.equal(edition.sections[0].stories[1].context, '');
  assert.equal(edition.analysis, 'Análise.');
  for (const field of ['_id', '__v', 'status', 'createdAt', 'updatedAt']) {
    assert.equal(field in edition, false, field + ' should not be public');
  }
});

test('lists only identification and counts in the archive', async () => {
  await handler(createRequest(), createResponse());

  assert.equal(state.selectCalls.length, 1);
  const fields = state.selectCalls[0].split(' ');
  assert.ok(fields.includes('sections.title'));
  assert.ok(!fields.includes('sections.stories.summary'));
  assert.ok(!fields.includes('analysis'));
});

test('accepts dates stored as strings', async () => {
  state.selectedEdition = storedEdition({ weekStart: '2026-11-02T00:00:00.000Z', publishedAt: 'not a date' });
  const response = createResponse();
  await handler(createRequest({ query: { slug: 'semana-01' } }), response);

  assert.equal(response.body.edition.weekStart, '2026-11-02T00:00:00.000Z');
  assert.equal(response.body.edition.publishedAt, null);
});

test('returns an empty archive when nothing is published', async () => {
  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { edition: null, editions: [] });
});

test('returns 404 without caching when the requested edition is not published', async () => {
  const response = createResponse();
  await handler(createRequest({ query: { slug: 'semana-02' } }), response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { error: 'Edição não encontrada.' });
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('converts database failures into a generic server error', async t => {
  t.mock.method(console, 'error', () => {});
  state.databaseError = new Error('database unavailable');
  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: 'Não foi possível carregar as edições semanais.' });
});
