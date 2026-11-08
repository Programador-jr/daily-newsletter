const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  databaseCalls: 0,
  databaseError: null,
  editions: [],
  selectedEdition: null,
  findCalls: [],
  findOneCalls: []
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
      return {
        sort: () => ({
          limit: () => ({
            lean: async () => state.editions
          })
        })
      };
    },
    findOne: query => {
      state.findOneCalls.push(query);
      return { lean: async () => state.selectedEdition };
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

beforeEach(() => {
  state.databaseCalls = 0;
  state.databaseError = null;
  state.editions = [];
  state.selectedEdition = null;
  state.findCalls = [];
  state.findOneCalls = [];
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

test('returns only the published editions collection query', async () => {
  state.editions = [{ slug: 'semana-01', status: 'published' }];
  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { editions: state.editions });
  assert.deepEqual(state.findCalls, [{ status: 'published' }]);
  assert.equal(response.headers['Cache-Control'], 'public, s-maxage=300, stale-while-revalidate=600');
});

test('returns a published edition by slug', async () => {
  state.selectedEdition = { slug: 'semana-01', status: 'published' };
  const response = createResponse();
  await handler(createRequest({ query: { slug: 'SEMANA-01' } }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { edition: state.selectedEdition });
  assert.deepEqual(state.findOneCalls, [{ slug: 'semana-01', status: 'published' }]);
});

test('returns 404 when the requested edition is not published', async () => {
  const response = createResponse();
  await handler(createRequest({ query: { slug: 'semana-02' } }), response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { error: 'Edição não encontrada.' });
});

test('converts database failures into a generic server error', async t => {
  t.mock.method(console, 'error', () => {});
  state.databaseError = new Error('database unavailable');
  const response = createResponse();
  await handler(createRequest(), response);

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: 'Não foi possível carregar as edições semanais.' });
});
