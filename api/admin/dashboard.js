const { isSessionValid, hasAdminConfiguration } = require('../../lib/admin-auth');
const { connectAdminDatabase, getAdminModels } = require('../../lib/admin-db');
const { buildLatestEditionMetrics, getNewsKey } = require('../../lib/admin-metrics');
const { getWorkerSchedule, toAdminWorkerSchedule } = require('../../lib/worker-schedule');

function parseEditionDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 0;
  return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

module.exports = async function dashboard(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!isSessionValid(req)) return res.status(401).json({ error: 'Não autorizado.' });
  if (!hasAdminConfiguration()) {
    return res.status(503).json({ error: 'Acesso administrativo ainda não configurado.' });
  }
  if (!process.env.MONGODB_URI?.trim()) {
    return res.status(503).json({ error: 'Configure MONGODB_URI para carregar os dados do painel.' });
  }

  const days = [1, 7, 30].includes(Number(req.query?.days)) ? Number(req.query.days) : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    await connectAdminDatabase();
    const { Subscriber, EmailEvent, NewsletterRun, News, NewsDelivery } = getAdminModels();
    const workerSchedule = toAdminWorkerSchedule(await getWorkerSchedule());
    const [totalSubscribers, confirmedSubscribers, pendingSubscribers, expiredPendingSubscribers,
      emailGroups, recentEmails, recentRuns] = await Promise.all([
      Subscriber.countDocuments({}),
      Subscriber.countDocuments({ confirmed: true }),
      Subscriber.countDocuments({ confirmed: { $ne: true }, confirmationTokenExpiresAt: { $gt: new Date() } }),
      Subscriber.countDocuments({ confirmed: { $ne: true }, $or: [
        { confirmationTokenExpiresAt: null },
        { confirmationTokenExpiresAt: { $lte: new Date() } }
      ] }),
      EmailEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { kind: '$kind', status: '$status' },
          messages: { $sum: 1 },
          acceptedRecipients: { $sum: '$acceptedCount' },
          rejectedRecipients: { $sum: '$rejectedCount' }
        } }
      ]),
      EmailEvent.find({ createdAt: { $gte: since } })
        .select('kind status acceptedCount rejectedCount errorCode createdAt')
        .sort({ createdAt: -1 }).limit(30).lean(),
      NewsletterRun.find({ startedAt: { $gte: since } })
        .select('trigger status startedAt completedAt editionDate newStories recipients errorCode')
        .sort({ startedAt: -1 }).limit(30).lean()
    ]);

    const emailTotals = { messages: 0, acceptedMessages: 0, acceptedRecipients: 0,
      rejectedRecipients: 0, failedMessages: 0, byKind: {} };
    for (const group of emailGroups) {
      const { kind, status } = group._id;
      emailTotals.messages += group.messages;
      emailTotals.acceptedRecipients += group.acceptedRecipients;
      emailTotals.rejectedRecipients += group.rejectedRecipients;
      if (status === 'accepted' || status === 'partially_accepted') {
        emailTotals.acceptedMessages += group.messages;
      }
      if (status === 'failed') emailTotals.failedMessages += group.messages;
      emailTotals.byKind[kind] ||= { messages: 0, acceptedRecipients: 0, failedMessages: 0 };
      emailTotals.byKind[kind].messages += group.messages;
      emailTotals.byKind[kind].acceptedRecipients += group.acceptedRecipients;
      if (status === 'failed') emailTotals.byKind[kind].failedMessages += group.messages;
    }

    const editionRows = await News.find().select('editionDate').lean();
    const latestEditionDate = editionRows
      .sort((a, b) => parseEditionDate(b.editionDate) - parseEditionDate(a.editionDate))[0]?.editionDate || null;
    let latestEdition;

    if (latestEditionDate) {
      const stories = await News.find({ editionDate: latestEditionDate })
        .select('editionDate title url').lean();
      const keys = stories.map(getNewsKey);
      const deliveredRows = keys.length
        ? await NewsDelivery.find({ newsKey: { $in: keys } }).select('newsKey').lean()
        : [];
      const deliveredKeys = new Set(deliveredRows.map(row => row.newsKey));
      const [lastRun, activeRun] = await Promise.all([
        NewsletterRun.findOne({ editionDate: latestEditionDate })
          .select('trigger status startedAt completedAt recipients errorCode')
          .sort({ startedAt: -1 }).lean(),
        NewsletterRun.findOne({ status: 'running' })
          .select('trigger status startedAt completedAt recipients errorCode')
          .lean()
      ]);
      latestEdition = buildLatestEditionMetrics({
        editionDate: latestEditionDate,
        stories,
        deliveredKeys: [...deliveredKeys],
        lastRun,
        activeRun
      });
    } else {
      latestEdition = buildLatestEditionMetrics({});
    }

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      timezone: 'America/Rio_Branco',
      periodDays: days,
      workerSchedule,
      subscribers: { total: totalSubscribers, confirmed: confirmedSubscribers,
        pending: pendingSubscribers, expiredPending: expiredPendingSubscribers },
      latestEdition,
      emails: emailTotals,
      recentEmails,
      recentRuns
    });
  } catch (error) {
    console.error(JSON.stringify({
      event: 'admin.dashboard.failed',
      code: /^[A-Z0-9_]+$/.test(error.code || '') ? error.code : 'DASHBOARD_ERROR'
    }));
    return res.status(503).json({ error: 'Não foi possível carregar os dados administrativos.' });
  }
};
