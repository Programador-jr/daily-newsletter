const handlers = {
  'admin/dashboard': require('../lib/api-handlers/admin/dashboard'),
  'admin/dispatch': require('../lib/api-handlers/admin/dispatch'),
  'admin/test-email': require('../lib/api-handlers/admin/test-email'),
  'admin/login': require('../lib/api-handlers/admin/login'),
  'admin/logout': require('../lib/api-handlers/admin/logout'),
  'admin/schedule': require('../lib/api-handlers/admin/schedule'),
  'admin/updates': require('../lib/api-handlers/admin/updates'),
  'worker/config': require('../lib/api-handlers/worker/config'),
  'worker/heartbeat': require('../lib/api-handlers/worker/heartbeat'),
  'updates/active': require('../lib/api-handlers/updates/active')
};

module.exports = function controlHandler(req, res) {
  const route = req.query?.route;
  const handler = typeof route === 'string' ? handlers[route] : null;
  if (!handler) return res.status(404).json({ error: 'Rota não encontrada.' });
  return handler(req, res);
};
