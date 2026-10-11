const { isSessionValid } = require('../../admin-auth');
const { connectAdminDatabase } = require('../../admin-db');
const { getWorkerSchedule, updateWorkerSchedule, toAdminWorkerSchedule } = require('../../worker-schedule');

function parseUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const intervalHours = Number(body.intervalHours);
  if (!Number.isInteger(intervalHours) || intervalHours < 1 || intervalHours > 168 || typeof body.enabled !== 'boolean') return null;
  return { intervalHours, enabled: body.enabled };
}

module.exports = async function adminSchedule(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Configure MONGODB_URI para gerenciar o agendamento.' });

  const update = req.method === 'PUT' ? parseUpdate(req.body) : null;
  if (req.method === 'PUT' && !update) {
    return res.status(400).json({ error: 'Informe um intervalo inteiro entre 1 e 168 horas e o estado do agendamento.' });
  }

  try {
    await connectAdminDatabase();
    const schedule = update
      ? await updateWorkerSchedule(update.intervalHours, update.enabled, 'admin')
      : await getWorkerSchedule();
    return res.status(200).json({ workerSchedule: toAdminWorkerSchedule(schedule) });
  } catch (error) {
    console.error(JSON.stringify({ event: 'admin.schedule.failed', code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'SCHEDULE_UPDATE_FAILED' }));
    return res.status(503).json({ error: 'Não foi possível carregar ou salvar o agendamento.' });
  }
};
