const { connectAdminDatabase } = require('../../admin-db');
const AdminUpdate = require('../../admin-update');
const { setPublicCache } = require('../../public-cache');

module.exports = async function activeUpdate(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!process.env.MONGODB_URI?.trim()) return res.status(200).json({ update: null });

  try {
    const now = new Date();
    await connectAdminDatabase();
    const update = await AdminUpdate.findOne({
      active: true, startsAt: { $lte: now }, endsAt: { $gt: now }
    }).sort({ updatedAt: -1 }).select('title body startsAt endsAt maxDisplays activationId').lean();
    // Toda página pergunta pelo aviso: a CDN responde por 1 minuto em vez do
    // Mongo. Só respostas vindas do banco são cacheadas; falhas seguem no-store.
    setPublicCache(res, 60, 300);
    if (!update) return res.status(200).json({ update: null });
    return res.status(200).json({ update: {
      title: update.title, body: update.body, startsAt: update.startsAt,
      endsAt: update.endsAt, maxDisplays: update.maxDisplays,
      activationId: update.activationId
    } });
  } catch (error) {
    console.error(JSON.stringify({ event: 'updates.public.failed', code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'UPDATES_UNAVAILABLE' }));
    return res.status(200).json({ update: null });
  }
};
