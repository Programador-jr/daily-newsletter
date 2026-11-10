const { connectDatabase } = require('../lib/db');
const { sendScheduledDigests } = require('../lib/digest-sender');
const { isBearerAuthorized } = require('../lib/bearer-auth');

// News stay on the site; subscribers only receive the daily digest. It goes
// out when an admin sends it, or automatically at the configured time. The
// worker keeps calling this endpoint, which also resumes interrupted sends.
async function notifyLatestNews() {
  await connectDatabase();
  return sendScheduledDigests();
}

async function runAndRecord(req, trigger = 'notify-news') {
  const NewsletterRun = require('../lib/newsletter-run');
  await connectDatabase();
  await NewsletterRun.createIndexes();

  const staleBefore = new Date(Date.now() - 45 * 60 * 1000);
  await NewsletterRun.updateMany({
    status: 'running',
    startedAt: { $lt: staleBefore }
  }, {
    $set: { status: 'failed', completedAt: new Date(), errorCode: 'RUN_TIMEOUT' }
  });

  let run;
  try {
    run = await NewsletterRun.create({ status: 'running', trigger, editionDate: null, startedAt: new Date() });
  } catch (error) {
    if (error.code === 11000) {
      throw Object.assign(new Error('Já existe um disparo em andamento.'), { code: 'NEWSLETTER_RUN_ACTIVE' });
    }
    throw error;
  }

  try {
    const result = await notifyLatestNews();
    await NewsletterRun.updateOne({ _id: run._id }, {
      $set: {
        status: result.failedRecipients > 0 ? 'failed' : result.sent ? 'succeeded' : 'skipped',
        completedAt: new Date(),
        editionDate: result.editionDate || null,
        newStories: result.newStories || 0,
        recipients: result.recipients || 0,
        failedRecipients: result.failedRecipients || 0
      }
    });
    return result;
  } catch (error) {
    const rawCode = error?.code || error?.name || 'NEWSLETTER_RUN_FAILED';
    const errorCode = /^[A-Z0-9_]+$/.test(rawCode) ? rawCode : 'NEWSLETTER_RUN_FAILED';
    await NewsletterRun.updateOne({ _id: run._id }, {
      $set: { status: 'failed', completedAt: new Date(), errorCode }
    }).catch(() => {});
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!isBearerAuthorized(req, process.env.NOTIFY_SECRET)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const result = await runAndRecord(req, 'notify-news');
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'NEWSLETTER_RUN_ACTIVE') {
      // A concurrent run is a safe no-op for the scheduled worker.
      return res.status(200).json({ sent: false, skipped: true, reason: 'run_active', newStories: 0, recipients: 0, failedRecipients: 0 });
    }
    console.error('Erro ao enviar atualizações:', error);
    return res.status(500).json({ error: 'Não foi possível enviar as atualizações.' });
  }
};

module.exports.notifyLatestNews = notifyLatestNews;
module.exports.runAndRecord = runAndRecord;
