function getAppUrl(environment = process.env) {
  const configured = environment.APP_URL;
  if (!configured) {
    if (environment.NODE_ENV === 'production') throw new Error('APP_URL é obrigatória em produção.');
    return 'http://localhost:3000';
  }
  let url;
  try { url = new URL(configured); } catch { throw new Error('APP_URL deve ser uma URL HTTP ou HTTPS válida.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_URL deve conter somente a origem HTTP(S), sem caminho, credenciais ou parâmetros.');
  }
  return url.origin;
}
module.exports = { getAppUrl };
