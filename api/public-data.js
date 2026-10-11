const handlers = {
  'camara-ceap': require('../lib/api-handlers/public-data/camara-ceap'),
  'camara-deputados': require('../lib/api-handlers/public-data/camara-deputados'),
  'camara-despesas': require('../lib/api-handlers/public-data/camara-despesas'),
  'transferegov-emendas': require('../lib/api-handlers/public-data/transferegov-emendas')
};

module.exports = function publicDataHandler(req, res) {
  const source = req.query?.source;
  const handler = typeof source === 'string' ? handlers[source] : null;
  if (!handler) return res.status(404).json({ error: 'Fonte de dados não encontrada.' });
  return handler(req, res);
};
