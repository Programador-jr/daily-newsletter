const crypto = require('node:crypto');
const mongoose = require('mongoose');
const { isSessionValid } = require('../../admin-auth');
const { connectAdminDatabase } = require('../../admin-db');
const AdminUpdate = require('../../admin-update');

function parseUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (typeof body.startsAt !== 'string' || !body.startsAt.trim() ||
      typeof body.endsAt !== 'string' || !body.endsAt.trim()) return null;
  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);
  const maxDisplays = Number(body.maxDisplays);
  if (!title || title.length > 120 || !text || text.length > 4000 ||
      !Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) ||
      endsAt <= startsAt || !Number.isInteger(maxDisplays) || maxDisplays < 1 || maxDisplays > 20 ||
      typeof body.active !== 'boolean') return null;
  return { title, body: text, startsAt, endsAt, maxDisplays, active: body.active };
}

function serialize(item) {
  return {
    id: String(item._id), title: item.title, body: item.body,
    startsAt: item.startsAt, endsAt: item.endsAt, maxDisplays: item.maxDisplays,
    active: item.active, activationId: item.activationId,
    createdAt: item.createdAt, updatedAt: item.updatedAt
  };
}

module.exports = async function adminUpdates(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Configure MONGODB_URI para gerenciar atualizações.' });

  const update = ['POST', 'PUT'].includes(req.method) ? parseUpdate(req.body) : null;
  if (['POST', 'PUT'].includes(req.method) && !update) {
    return res.status(400).json({ error: 'Revise título, descrição, período e quantidade de aparições (1 a 20).' });
  }
  if (update?.active && update.endsAt <= new Date()) {
    return res.status(400).json({ error: 'Para publicar ou reativar, escolha uma data final futura.' });
  }
  const id = String(req.body?.id || '');
  if (['PUT', 'DELETE'].includes(req.method) && !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Atualização não encontrada.' });
  }

  try {
    await connectAdminDatabase();
    if (req.method === 'GET') {
      const updates = await AdminUpdate.find().sort({ updatedAt: -1 }).limit(50).lean();
      return res.status(200).json({ updates: updates.map(serialize) });
    }
    if (req.method === 'DELETE') {
      const removed = await AdminUpdate.findByIdAndDelete(id);
      if (!removed) return res.status(404).json({ error: 'Nota não encontrada.' });
      return res.status(200).json({ deleted: true, id });
    }
    if (req.method === 'POST') {
      if (update.active) await AdminUpdate.updateMany({ active: true }, { $set: { active: false } });
      const item = await AdminUpdate.create({ ...update, activationId: crypto.randomUUID() });
      return res.status(201).json({ update: serialize(item) });
    }

    const current = await AdminUpdate.findById(id);
    if (!current) return res.status(404).json({ error: 'Atualização não encontrada.' });
    const reactivated = !current.active && update.active;
    const campaignChanged = current.title !== update.title || current.body !== update.body ||
      current.startsAt.getTime() !== update.startsAt.getTime() ||
      current.endsAt.getTime() !== update.endsAt.getTime() || current.maxDisplays !== update.maxDisplays;
    if (update.active) await AdminUpdate.updateMany({ _id: { $ne: current._id }, active: true }, { $set: { active: false } });
    Object.assign(current, update);
    if (reactivated || (current.active && campaignChanged)) current.activationId = crypto.randomUUID();
    await current.save();
    return res.status(200).json({ update: serialize(current) });
  } catch (error) {
    console.error(JSON.stringify({ event: 'admin.updates.failed', code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'UPDATES_ERROR' }));
    return res.status(503).json({ error: 'Não foi possível carregar ou salvar as atualizações.' });
  }
};
