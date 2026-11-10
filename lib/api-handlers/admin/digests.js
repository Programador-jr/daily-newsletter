const mongoose = require('mongoose');
const { isSessionValid } = require('../../admin-auth');
const { connectAdminDatabase } = require('../../admin-db');
const DailyDigest = require('../../daily-digest');
const Subscriber = require('../../subscriber');
const { renderDigestEmail } = require('../../digest-email');
const { editionKey, editionDateVariants } = require('../../digest-schedule');
const { sendEmail } = require('../../email');
const { getAppUrl } = require('../../app-url');
const { getEmailBanner } = require('../../newsletter-settings');
const { runAndRecord } = require('../../../api/notify-news');

const APPROVABLE = ['draft', 'failed'];
const LIST_FIELDS = 'editionDate timezone status subject preheader headline storyCount approvedAt sentAt delivery createdAt updatedAt';

function errorCode(error, fallback) {
  return /^[A-Z0-9_]+$/.test(error?.code || '') ? error.code : fallback;
}

function toSummary(digest) {
  return {
    id: String(digest._id),
    editionDate: digest.editionDate,
    timezone: digest.timezone,
    status: digest.status,
    subject: digest.subject,
    preheader: digest.preheader || '',
    headline: digest.headline || '',
    storyCount: digest.storyCount ?? (digest.stories || []).length,
    approvedAt: digest.approvedAt || null,
    sentAt: digest.sentAt || null,
    delivery: {
      sentCount: digest.delivery?.sentCount || 0,
      failedCount: digest.delivery?.failedCount || 0
    },
    updatedAt: digest.updatedAt || null
  };
}

async function findDigest(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return DailyDigest.findById(id).lean();
}

async function getDigests(req, res) {
  const confirmedSubscribers = await Subscriber.countDocuments({ confirmed: true });
  if (req.query?.id) {
    const digest = await findDigest(req.query.id);
    if (!digest) return res.status(404).json({ error: 'Resumo não encontrado.' });
    const preview = renderDigestEmail(digest, { appUrl: getAppUrl(), mode: 'preview', banner: await getEmailBanner() });
    return res.status(200).json({
      digest: { ...toSummary(digest), editorialNotes: digest.editorialNotes || '', stories: digest.stories || [] },
      preview: { subject: preview.subject, html: preview.html, storyCount: preview.storyCount },
      confirmedSubscribers
    });
  }
  const digests = await DailyDigest.find().select(LIST_FIELDS).sort({ createdAt: -1 }).limit(30).lean();
  return res.status(200).json({ digests: digests.map(toSummary), confirmedSubscribers });
}

async function approveDigest(req, res, digest) {
  if (!APPROVABLE.includes(digest.status)) {
    return res.status(409).json({ error: 'Este resumo não pode ser aprovado no estado atual.' });
  }
  const renderable = renderDigestEmail(digest);
  if (!renderable.storyCount) return res.status(422).json({ error: 'O resumo não tem notícias para enviar.' });

  const conflict = await DailyDigest.exists({
    _id: { $ne: digest._id },
    editionDate: { $in: editionDateVariants(editionKey(digest.editionDate)) },
    status: { $in: ['approved', 'sending', 'sent'] }
  });
  if (conflict) return res.status(409).json({ error: 'Já existe outro resumo aprovado ou enviado para esta data.' });

  const confirmedSubscribers = await Subscriber.countDocuments({ confirmed: true });
  if (!confirmedSubscribers) return res.status(409).json({ error: 'Não há assinantes confirmados para receber o resumo.' });

  const approved = await DailyDigest.updateOne(
    { _id: digest._id, status: { $in: APPROVABLE } },
    { $set: { status: 'approved', approvedAt: new Date(), approvedBy: 'admin' } }
  );
  if (approved.modifiedCount !== 1) {
    return res.status(409).json({ error: 'O resumo mudou de estado. Recarregue e tente novamente.' });
  }

  try {
    const result = await runAndRecord(req, 'admin-manual');
    const updated = await DailyDigest.findById(digest._id).select(LIST_FIELDS).lean();
    return res.status(200).json({ approved: true, queued: false, result, digest: updated ? toSummary(updated) : null });
  } catch (error) {
    if (error.code === 'NEWSLETTER_RUN_ACTIVE') {
      // The digest stays approved; the next worker run sends it.
      return res.status(202).json({ approved: true, queued: true });
    }
    throw error;
  }
}

async function sendTest(req, res, digest) {
  const recipient = String(req.body?.email || '').trim().toLowerCase();
  if (recipient.length > 254 || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(recipient)) {
    return res.status(400).json({ error: 'Informe um endereço de e-mail válido para receber o teste.' });
  }
  const email = renderDigestEmail(digest, { appUrl: getAppUrl(), mode: 'test', banner: await getEmailBanner() });
  if (!email.storyCount) return res.status(422).json({ error: 'O resumo não tem notícias para enviar.' });
  const result = await sendEmail({ kind: 'newsletter-test', to: recipient, subject: email.subject, html: email.html, text: email.text });
  return res.status(200).json({ sent: true, editionDate: digest.editionDate, stories: email.storyCount, messageId: result?.messageId || null });
}

module.exports = async function adminDigests(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!process.env.MONGODB_URI?.trim()) return res.status(503).json({ error: 'Configure MONGODB_URI para gerenciar os resumos.' });

  try {
    await connectAdminDatabase();
    if (req.method === 'GET') return await getDigests(req, res);

    const action = req.body?.action;
    if (!['approve', 'test'].includes(action)) return res.status(400).json({ error: 'Ação inválida.' });
    const digest = await findDigest(req.body?.id);
    if (!digest) return res.status(404).json({ error: 'Resumo não encontrado.' });
    return action === 'approve' ? await approveDigest(req, res, digest) : await sendTest(req, res, digest);
  } catch (error) {
    console.error(JSON.stringify({ event: 'admin.digests.failed', code: errorCode(error, 'DIGESTS_FAILED') }));
    return res.status(500).json({ error: 'Não foi possível concluir a operação do resumo.' });
  }
};
