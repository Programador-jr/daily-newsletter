const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const state = {
  records: [],
  databaseCalls: 0
};

const modules = {
  '../lib/db': {
    connectDatabase: async () => {
      state.databaseCalls += 1;
    }
  },
  '../lib/news': {
    find: (...args) => {
      if (args.length === 0) {
        return {
          select: () => ({
            lean: async () => state.records
          })
        };
      }

      const editionDate = args[0]?.editionDate;
      return {
        lean: async () => state.records.filter(story => story.editionDate === editionDate)
      };
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
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader() {},
    json(body) {
      this.body = body;
      return this;
    }
  };
}

function createRequest(query = {}) {
  return {
    method: 'GET',
    query,
    headers: {},
    body: {}
  };
}

function story(editionDate, publishedAt, title, headline = false) {
  return {
    _id: title,
    editionDate,
    publishedAt,
    title,
    category: 'Brasil',
    summary: 'Resumo',
    context: 'Contexto',
    source: 'Fonte',
    url: 'https://example.com/' + encodeURIComponent(title),
    headline
  };
}

beforeEach(() => {
  state.databaseCalls = 0;
  state.records = [
    story('14/10/2026', '14/10/2026', 'Notícia de hoje', true),
    story('14/10/2026', '13/10/2026', 'Notícia de ontem atribuída à edição atual'),
    story('14/10/2026', '09/10/2026', 'Notícia antiga atribuída à edição atual'),
    story('13/10/2026', '13/10/2026', 'Notícia da edição arquivada'),
    story('13/10/2026', '12/10/2026', 'Notícia anterior preservada no arquivo')
  ];
});

test('a edição atual exibe somente notícias publicadas na data da edição', async () => {
  const response = createResponse();

  await newsHandler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.date, '14/10/2026');
  assert.deepEqual(response.body.stories.map(item => item.title), ['Notícia de hoje']);
});

test('a consulta explícita da edição atual aplica o mesmo filtro por data', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ date: '14/10/2026' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.stories.map(item => item.title), ['Notícia de hoje']);
});

test('edições antigas preservam as notícias vinculadas ao arquivo mesmo se publicadas antes', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ date: '13/10/2026' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.stories.map(item => item.title), [
    'Notícia da edição arquivada',
    'Notícia anterior preservada no arquivo'
  ]);
});

test('o histórico conta apenas notícias do próprio dia na edição mais recente', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ history: 'true' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, [
    { date: '14/10/2026', stories: 1, title: 'Edição de 14/10/2026' },
    { date: '13/10/2026', stories: 2, title: 'Edição de 13/10/2026' }
  ]);
});
