const { connectAdminDatabase } = require('../../lib/admin-db');
const { hasWorkerControlSecret, isWorkerAuthenticated } = require('../../lib/worker-auth');
const { getWorkerSchedule } = require('../../lib/worker-schedule');

module.exports = async function workerConfig(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!hasWorkerControlSecret()) return res.status(503).json({ error: 'Controle do worker não configurado.' });
  if (!isWorkerAuthenticated(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Banco de dados indisponível.' });

  try {
    await connectAdminDatabase();
    const schedule = await getWorkerSchedule();
    return res.status(200).json({
      revision: schedule.revision,
      intervalHours: schedule.intervalHours,
      enabled: schedule.enabled,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'worker.config.failed', code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'WORKER_CONFIG_FAILED' }));
    return res.status(503).json({ error: 'Não foi possível carregar a configuração do worker.' });
  }
};
