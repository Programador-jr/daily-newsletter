'use strict';

function clientMessage(status) {
  if (status === 400) return 'Requisição inválida.';
  if (status === 413) return 'Requisição muito grande.';
  if (status === 415) return 'Tipo de conteúdo não suportado.';
  if (status >= 500) return 'Erro interno do servidor.';
  return 'Requisição inválida.';
}

// Express' default error handler exposes stack traces and absolute file paths
// when NODE_ENV is not "production". Always return a generic response instead.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const rawStatus = Number(error?.status || error?.statusCode);
  const status = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
    ? rawStatus
    : 500;

  const rawCode = error?.code || error?.name || 'UNEXPECTED_ERROR';
  console.error(JSON.stringify({
    event: 'http.request.failed',
    method: req.method,
    path: req.path,
    status,
    code: /^[A-Z0-9_]+$/.test(rawCode) ? rawCode : 'UNEXPECTED_ERROR'
  }));

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: clientMessage(status) });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).type('text/plain').send(clientMessage(status));
}

module.exports = { errorHandler };
