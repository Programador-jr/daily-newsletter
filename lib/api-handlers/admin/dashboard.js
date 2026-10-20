const { isSessionValid, hasAdminConfiguration } = require('../../admin-auth');
const { connectAdminDatabase, getAdminModels } = require('../../admin-db');
const { buildLatestEditionMetrics, getNewsKey } = require('../../admin-metrics');
const { getWorkerSchedule, toAdminWorkerSchedule } = require('../../worker-schedule');
const { calendarDateKey } = require('../../news-date');

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
    const { Subscriber, EmailEvent, NewsletterRun, News, NewsDelivery, RecipientNewsDelivery } = getAdminModels();
    const workerSchedule = toAdminWorkerSchedule(await getWorkerSchedule());
    const [totalSubscribers, confirmedSubscribers, pendingSubscribers, expiredPendingSubscribers,
      emailGroups, dailyEmails, dailyRuns, recentEmails, recentRuns] = await Promise.all([
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
      EmailEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Rio_Branco' } },
          acceptedRecipients: { $sum: { $cond: [{ $in: ['$status', ['accepted', 'partially_accepted']] }, '$acceptedCount', 0] } },
          rejectedRecipients: { $sum: '$rejectedCount' },
          failedMessages: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          messages: { $sum: 1 }
        } },
        { $sort: { _id: 1 } }
      ]),
      NewsletterRun.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt', timezone: 'America/Rio_Branco' } },
          succeeded: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          total: { $sum: 1 }
        } },
        { $sort: { _id: 1 } }
      ]),
      EmailEvent.find({ createdAt: { $gte: since } })
        .select('kind status acceptedCount rejectedCount errorCode createdAt')
        .sort({ createdAt: -1 }).limit(30).lean(),
      NewsletterRun.find({ startedAt: { $gte: since } })
        .select('trigger status startedAt completedAt editionDate newStories recipients failedRecipients errorCode')
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
      const editionDateKey = calendarDateKey(latestEditionDate);
      const editionStories = await News.find({ editionDate: latestEditionDate })
        .select('editionDate title url publishedAt').lean();
      const stories = editionStories.filter(story => calendarDateKey(story.publishedAt) === editionDateKey);
      const excludedStories = editionStories.length - stories.length;
      const keys = stories.map(getNewsKey);
      // Legacy story-level records remain valid, but current sends are tracked per recipient.
      // Count a story as delivered when at least one recipient has a confirmed SMTP-accepted record.
      const [legacyDeliveredRows, recipientDeliveredRows] = keys.length
        ? await Promise.all([
          NewsDelivery.find({ newsKey: { $in: keys } }).select('newsKey').lean(),
          RecipientNewsDelivery.find({ newsKey: { $in: keys }, status: 'sent' }).select('newsKey').lean()
        ])
        : [[], []];
      const deliveredKeys = new Set([
        ...legacyDeliveredRows.map(row => row.newsKey),
        ...recipientDeliveredRows.map(row => row.newsKey)
      ]);
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
        excludedStories,
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
      dailyActivity: { emails: dailyEmails, runs: dailyRuns },
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
