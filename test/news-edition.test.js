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
      const editionDate = args[0]?.editionDate;
      return { lean: async () => state.records.filter(story => !editionDate || story.editionDate === editionDate) };
    },
    aggregate: async pipeline => {
      const parse = value => {
        const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        return match ? Date.UTC(Number(match[3]), Number(match[2])-1, Number(match[1])) : 0;
      };
      const latest = state.records.map(row => row.editionDate).sort((x,y)=>parse(y)-parse(x))[0] || null;
      if (pipeline.some(stage => stage.$group)) {
        const counts = new Map();
        for (const row of state.records) {
          counts.set(row.editionDate,(counts.get(row.editionDate)||0)+1);
        }
        return [...counts].map(([date,stories])=>({date,stories,title:'Edição de '+date})).sort((x,y)=>parse(y.date)-parse(x.date));
      }
      const match = pipeline.find(stage=>stage.$match&&stage.$match.editionDate);
      if (match) return state.records.filter(row=>row.editionDate===match.$match.editionDate)
        .sort((x,y)=>Number(Boolean(y.headline))-Number(Boolean(x.headline)));
      return latest ? [{editionDate:latest}] : [];
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

test('a edição atual exibe todas as notícias vinculadas, inclusive publicadas antes', async () => {
  const response = createResponse();

  await newsHandler(createRequest(), response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.date, '14/10/2026');
  assert.deepEqual(response.body.stories.map(item => item.title), [
    'Notícia de hoje',
    'Notícia de ontem atribuída à edição atual',
    'Notícia antiga atribuída à edição atual'
  ]);
});

test('a consulta explícita da edição atual preserva todas as notícias vinculadas', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ date: '14/10/2026' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.stories.map(item => item.title), [
    'Notícia de hoje',
    'Notícia de ontem atribuída à edição atual',
    'Notícia antiga atribuída à edição atual'
  ]);
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

test('o histórico conta todas as notícias vinculadas à edição mais recente', async () => {
  const response = createResponse();

  await newsHandler(createRequest({ history: 'true' }), response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, [
    { date: '14/10/2026', stories: 3, title: 'Edição de 14/10/2026' },
    { date: '13/10/2026', stories: 2, title: 'Edição de 13/10/2026' }
  ]);
});
