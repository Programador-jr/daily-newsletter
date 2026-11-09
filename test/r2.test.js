const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
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
  // As imagens não ficam mais no repositório (estão no R2): o teste usa um
  // arquivo temporário com cabeçalho JPEG.
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r2-test-'));
  const filePath = path.join(directory, 'karl-marx.jpg');
  const file = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]);
  fs.writeFileSync(filePath, file);
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
    fs.rmSync(directory, { recursive: true, force: true });
    global.fetch = originalFetch;
    for (const [name, value] of Object.entries(environment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
