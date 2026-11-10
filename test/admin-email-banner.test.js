const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const { createSessionToken } = require('../lib/admin-auth');

const state = { banner: null, uploads: [], r2Error: null };

const modules = {
  '../lib/admin-db': { connectAdminDatabase: async () => {} },
  '../lib/newsletter-settings': {
    getEmailBanner: async () => state.banner || { url: 'https://default.example.com/banner.png', alt: "King's Newsletter", source: 'default' },
    setEmailBanner: async ({ url, alt, source }) => { state.banner = { url, alt, source }; return state.banner; },
    resetEmailBanner: async () => { state.banner = null; return { url: 'https://default.example.com/banner.png', alt: "King's Newsletter", source: 'default' }; }
  },
  '../lib/r2': {
    uploadBufferToR2: async (buffer, key, contentType) => {
      if (state.r2Error) throw state.r2Error;
      state.uploads.push({ size: buffer.length, key, contentType });
      return { url: 'https://media.example.com/' + key, key, contentType, size: buffer.length };
    },
    validatePublicHttpsUrl: async value => {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname === 'localhost') throw new Error('not allowed');
      return url;
    }
  }
};

const originals = new Map();
for (const [modulePath, exports] of Object.entries(modules)) {
  const resolved = require.resolve(modulePath);
  originals.set(resolved, require.cache[resolved]);
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
}
const handlerPath = require.resolve('../lib/api-handlers/admin/email-banner');
delete require.cache[handlerPath];
const emailBanner = require('../lib/api-handlers/admin/email-banner');
for (const [resolved, original] of originals) {
  if (original) require.cache[resolved] = original;
  else delete require.cache[resolved];
}
delete require.cache[handlerPath];

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

function adminRequest(method, body) {
  return { method, body, headers: { cookie: 'kings_admin_session=' + encodeURIComponent(createSessionToken()) }, query: {} };
}

function mockResponse() {
  return {
    statusCode: null,
    body: null,
    setHeader() {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function call(method, body) {
  const res = mockResponse();
  await emailBanner(adminRequest(method, body), res);
  return res;
}

beforeEach(() => {
  Object.assign(process.env, {
    ADMIN_USERNAME: 'newsletter-admin',
    ADMIN_PASSWORD: 'Test-Password-1',
    ADMIN_SESSION_SECRET: 'test-session-secret-with-more-than-32-characters',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://example.invalid/test'
  });
  state.banner = null;
  state.uploads = [];
  state.r2Error = null;
});

test('requires an admin session', async () => {
  const res = mockResponse();
  await emailBanner({ method: 'GET', headers: {}, query: {} }, res);
  assert.equal(res.statusCode, 401);
});

test('returns the default banner until one is chosen', async () => {
  const res = await call('GET');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.banner.source, 'default');
});

test('uploads an image file to R2 and saves its public URL', async () => {
  const res = await call('PUT', { source: 'upload', dataBase64: 'data:image/png;base64,' + PNG.toString('base64'), alt: 'Banner de Natal' });
  assert.equal(res.statusCode, 200);
  assert.equal(state.uploads.length, 1);
  assert.match(state.uploads[0].key, /^email\/banner-[0-9a-f]{24}\.png$/);
  assert.equal(state.uploads[0].contentType, 'image/png');
  assert.deepEqual(res.body.banner, { url: 'https://media.example.com/' + state.uploads[0].key, alt: 'Banner de Natal', source: 'upload' });
});

test('rejects files that are not PNG, JPG, GIF or WebP, whatever the declared type', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  const res = await call('PUT', { source: 'upload', dataBase64: 'data:image/png;base64,' + svg.toString('base64') });
  assert.equal(res.statusCode, 415);
  assert.equal(state.uploads.length, 0);
});

test('rejects files over 2 MB', async () => {
  const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);
  const res = await call('PUT', { source: 'upload', dataBase64: big.toString('base64') });
  assert.equal(res.statusCode, 413);
});

test('saves a public https link as is', async () => {
  const res = await call('PUT', { source: 'link', url: 'https://images.example.com/banner.jpg', alt: '' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.banner.url, 'https://images.example.com/banner.jpg');
  assert.equal(res.body.banner.source, 'link');
  assert.equal(state.uploads.length, 0);
});

test('rejects links that are not public https', async () => {
  for (const url of ['http://images.example.com/a.png', 'https://localhost/a.png', 'not a url']) {
    const res = await call('PUT', { source: 'link', url });
    assert.equal(res.statusCode, 400, url);
  }
});

test('explains when R2 is not configured', async () => {
  state.r2Error = Object.assign(new Error('missing'), { code: 'R2_NOT_CONFIGURED' });
  const res = await call('PUT', { source: 'upload', dataBase64: PNG.toString('base64') });
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /Use um link/);
});

test('restores the default banner', async () => {
  await call('PUT', { source: 'link', url: 'https://images.example.com/banner.jpg' });
  const res = await call('DELETE');
  assert.equal(res.body.banner.source, 'default');
});

test('detects image types from the file bytes', () => {
  const { detectImageType } = emailBanner;
  assert.equal(detectImageType(PNG).extension, 'png');
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])).extension, 'jpg');
  assert.equal(detectImageType(Buffer.from('GIF89a......')).extension, 'gif');
  assert.equal(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ')).extension, 'webp');
  assert.equal(detectImageType(Buffer.from('hello')), null);
});
