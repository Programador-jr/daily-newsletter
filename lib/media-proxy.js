'use strict';

// Repassa /media/* ao bucket público do R2 no servidor local, como a regra
// de rewrite do vercel.json faz em produção. As imagens não ficam mais no
// repositório; o proxy existe para o código que precisa ler os bytes pelo
// mesmo domínio (o R2 público não envia cabeçalhos CORS).
const DEFAULT_MEDIA_BASE = 'https://pub-fcf4bc76fe3b4643b8c8b2c76bc61ad1.r2.dev';
const MEDIA_PATH = /^(?:countries|personalities|parties|presidents|external\/wikimedia)\/[^?#]+$/i;
const FORWARDED_HEADERS = ['content-type', 'content-length', 'cache-control', 'etag', 'last-modified'];

function mediaBaseUrl(environment = process.env) {
  return (environment.R2_PUBLIC_BASE_URL || DEFAULT_MEDIA_BASE).trim().replace(/\/+$/, '');
}

function createMediaProxy({ fetchImpl = globalThis.fetch, environment = process.env } = {}) {
  return async function mediaProxy(req, res) {
    const segments = Array.isArray(req.params.path) ? req.params.path : [req.params.path];
    const objectPath = segments.join('/');
    if (!MEDIA_PATH.test(objectPath) || segments.some(segment => segment === '..' || segment === '.')) {
      return res.status(404).end();
    }

    try {
      const upstream = await fetchImpl(`${mediaBaseUrl(environment)}/${segments.map(encodeURIComponent).join('/')}`);
      res.status(upstream.status);
      for (const header of FORWARDED_HEADERS) {
        const value = upstream.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      if (!upstream.ok) return res.end();
      return res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      return res.status(502).end();
    }
  };
}

module.exports = { createMediaProxy, mediaBaseUrl };
