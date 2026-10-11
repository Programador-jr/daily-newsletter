const { connectAdminDatabase } = require('../../admin-db');
const { hasWorkerControlSecret, isWorkerAuthenticated } = require('../../worker-auth');
const { recordWorkerHeartbeat } = require('../../worker-schedule');

const VALID_RUN_STATUSES = new Set(['running', 'succeeded', 'skipped', 'failed', null]);

function parseDate(value) {
  if (value === null) return null;
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return undefined;
  return new Date(value);
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (typeof body.workerId !== 'string' || body.workerId.length < 8 || body.workerId.length > 100) return null;
  if (typeof body.enabled !== 'boolean' || typeof body.running !== 'boolean') return null;
  if (!Number.isInteger(body.intervalMs) || body.intervalMs < 60 * 60 * 1000 || body.intervalMs > 168 * 60 * 60 * 1000) return null;
  const lastRunAt = parseDate(body.lastRunAt);
  const nextRunAt = parseDate(body.nextRunAt);
  if (lastRunAt === undefined || nextRunAt === undefined) return null;
  if (!VALID_RUN_STATUSES.has(body.lastRunStatus)) return null;
  const lastRunErrorCode = body.lastRunErrorCode ?? null;
  if (lastRunErrorCode !== null && (typeof lastRunErrorCode !== 'string' || !/^[A-Z0-9_]{1,80}$/.test(lastRunErrorCode))) return null;
  return {
    workerId: body.workerId,
    enabled: body.enabled,
    running: body.running,
    lastRunAt,
    nextRunAt,
    lastRunStatus: body.lastRunStatus,
    lastRunErrorCode
  };
}

module.exports = async function workerHeartbeat(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!hasWorkerControlSecret()) return res.status(503).json({ error: 'Controle do worker não configurado.' });
  if (!isWorkerAuthenticated(req)) return res.status(401).json({ error: 'Não autorizado.' });
  const payload = validatePayload(req.body);
  if (!payload) return res.status(400).json({ error: 'Estado do worker inválido.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Banco de dados indisponível.' });

  try {
    await connectAdminDatabase();
    await recordWorkerHeartbeat(payload);
    return res.status(200).json({ ok: true, receivedAt: new Date().toISOString() });
  } catch (error) {
    console.error(JSON.stringify({ event: 'worker.heartbeat.failed', code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'WORKER_HEARTBEAT_FAILED' }));
    return res.status(503).json({ error: 'Não foi possível registrar o estado do worker.' });
  }
};
