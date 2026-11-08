const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { uploadFileToR2 } = require('../lib/r2');

test('uploads a local image to R2 with its content type and immutable cache', async () => {
  const environment = {
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL
  };
  const originalFetch = global.fetch;
  const filePath = path.join(__dirname, '..', 'public', 'personalities', 'portraits', 'karl-marx.jpg');
  const file = fs.readFileSync(filePath);
  let request;

  Object.assign(process.env, {
    CLOUDFLARE_ACCOUNT_ID: 'account-test',
    R2_ACCESS_KEY_ID: 'access-test',
    R2_SECRET_ACCESS_KEY: 'secret-test',
    R2_BUCKET_NAME: 'bucket-test',
    R2_PUBLIC_BASE_URL: 'https://media.example.test'
  });
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const result = await uploadFileToR2(filePath, 'personalities/portraits/karl-marx.jpg');
    assert.equal(result.url, 'https://media.example.test/personalities/portraits/karl-marx.jpg');
    assert.equal(result.contentType, 'image/jpeg');
    assert.equal(result.size, file.length);
    assert.match(request.url, /bucket-test\/personalities\/portraits\/karl-marx\.jpg$/);
    assert.equal(request.options.method, 'PUT');
    assert.equal(request.options.headers['Content-Type'], 'image/jpeg');
    assert.equal(request.options.headers['Cache-Control'], 'public, max-age=31536000, immutable');
    assert.deepEqual(request.options.body, file);
  } finally {
    global.fetch = originalFetch;
    for (const [name, value] of Object.entries(environment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
