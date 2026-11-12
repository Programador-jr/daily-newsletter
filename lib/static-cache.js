'use strict';

// Política de cache dos arquivos estáticos. A mesma tabela alimenta o
// express.static local e é conferida contra o bloco "headers" do vercel.json
// (test/vercel-config.test.js), para os dois ambientes não divergirem.
//
// CSS/JS ficam pouco tempo no cache e revalidam em segundo plano depois disso
// (stale-while-revalidate). Em produção o Cloudflare troca esse max-age por
// 14400 (4 h). As URLs dos arquivos não levam query de versão.
// HTML fica de fora e continua revalidando a cada visita.
const SHORT_REVALIDATE = 'public, max-age=300, stale-while-revalidate=86400';
const DATA_REVALIDATE = 'public, max-age=3600, stale-while-revalidate=86400';
const MEDIA_REVALIDATE = 'public, max-age=604800, stale-while-revalidate=2592000';
const IMMUTABLE = 'public, max-age=31536000, immutable';

const STATIC_CACHE_RULES = [
  { source: '/css/(.*)', pattern: /^\/css\//, cacheControl: SHORT_REVALIDATE },
  { source: '/js/(.*)', pattern: /^\/js\//, cacheControl: SHORT_REVALIDATE },
  { source: '/navigation.html', pattern: /^\/navigation\.html$/, cacheControl: SHORT_REVALIDATE },
  { source: '/footer.html', pattern: /^\/footer\.html$/, cacheControl: SHORT_REVALIDATE },
  { source: '/data/(.*)', pattern: /^\/data\//, cacheControl: DATA_REVALIDATE },
  { source: '/assets/(.*)', pattern: /^\/assets\//, cacheControl: MEDIA_REVALIDATE },
  // Fontes nunca mudam de conteúdo sob o mesmo nome.
  { source: '/fonts/(.*)', pattern: /^\/fonts\//, cacheControl: IMMUTABLE }
];

function staticCacheControl(urlPath) {
  const rule = STATIC_CACHE_RULES.find(({ pattern }) => pattern.test(urlPath));
  return rule ? rule.cacheControl : null;
}

// Para express.static: recebe o caminho do arquivo em disco e a raiz servida.
function staticCacheHeaders(mountPath = '') {
  const path = require('path');
  return (root) => (res, filePath) => {
    const relative = path.relative(root, filePath).split(path.sep).join('/');
    const cacheControl = staticCacheControl(`${mountPath}/${relative}`);
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
  };
}

module.exports = { STATIC_CACHE_RULES, staticCacheControl, staticCacheHeaders };
