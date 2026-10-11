const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const Subscriber = require('../lib/subscriber');
const NewsDelivery = require('../lib/news-delivery');
const { sendEmail } = require('../lib/email');
const { createToken, hashToken } = require('../lib/tokens');

function getNewsKey(story) {
  return story.url || `${story.editionDate || ''}|${story.title || ''}`;
}

function getAppUrl(req) {
  return (process.env.APP_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function notifyLatestNews(req) {
  try {
    await connectDatabase();

    const latest = await News.find().select('editionDate').lean();

    if (!latest.length) {
      return { sent: false, editionDate: null, newStories: 0, recipients: 0 };
    }

    const latestEditionDate = latest
      .sort((a, b) => {
        const parseDate = value => {
          const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (!match) return 0;
          return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
        };

        return parseDate(b.editionDate) - parseDate(a.editionDate);
      })[0]
      .editionDate;

    const stories = await News.find({ editionDate: latestEditionDate }).lean();
    stories.sort((a, b) => {
      const parseDate = value => {
        const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return 0;
        return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      };

      const difference = parseDate(b.publishedAt) - parseDate(a.publishedAt);
      return difference || String(a._id).localeCompare(String(b._id));
    });

    const keys = stories.map(getNewsKey);
    const delivered = await NewsDelivery.find({ newsKey: { $in: keys } }).select('newsKey').lean();
    const deliveredKeys = new Set(delivered.map(item => item.newsKey));
    const newStories = stories.filter(story => !deliveredKeys.has(getNewsKey(story)));

    if (!newStories.length) {
      return { sent: false, editionDate: latestEditionDate, newStories: 0, recipients: 0 };
    }

    const subscribers = await Subscriber.find({ confirmed: true }).lean();

    if (!subscribers.length) {
      return { sent: false, editionDate: latestEditionDate, newStories: newStories.length, recipients: 0 };
    }

    const appUrl = getAppUrl(req);
    let recipients = 0;

    for (const subscriber of subscribers) {
      let unsubscribeToken = subscriber.unsubscribeTokenHash;

      if (!unsubscribeToken) {
        unsubscribeToken = hashToken(createToken());
        await Subscriber.updateOne(
          { _id: subscriber._id },
          { $set: { unsubscribeTokenHash: unsubscribeToken } }
        );
      }

      const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${unsubscribeToken}`;
      const items = newStories.map(story => `
        <article style="padding:0 0 24px;margin:0 0 24px;border-bottom:1px solid #d8e5e1">
          <div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#0b766b">${escapeHtml(story.category || '')}</div>
          <h2 style="font-family:Georgia,serif;font-size:21px;line-height:1.25;margin:8px 0">${escapeHtml(story.title || '')}</h2>
          <p style="line-height:1.6;color:#536762">${escapeHtml(story.summary || '')}</p>
          <p style="line-height:1.6"><strong>Contexto:</strong> ${escapeHtml(story.context || '')}</p>
          <a href="${escapeHtml(story.url || '#')}" style="color:#0b766b;font-weight:bold">Ler fonte</a>
        </article>
      `).join('');

      const textItems = newStories.map(story =>
        `${story.title}\n${story.summary}\nContexto: ${story.context}\nFonte: ${story.url}`
      ).join('\n\n');

      const emailResult = await sendEmail({
        kind: 'newsletter',
        to: subscriber.email,
        subject: `Novas atualizações — ${latestEditionDate}`,
        text: `King's Newsletter\n\nNovas atualizações — ${latestEditionDate}\n\n${textItems}\n\nCancelar inscrição: ${unsubscribeUrl}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:32px;color:#1c2d2a">
            <h1 style="font-family:Georgia,serif;margin:0 0 8px">King's Newsletter</h1>
            <p style="color:#536762">Novas atualizações — ${escapeHtml(latestEditionDate)}</p>
            ${items}
            <p style="font-size:13px;color:#536762">Você está recebendo este e-mail porque confirmou sua inscrição.</p>
            <p style="font-size:13px"><a href="${unsubscribeUrl}" style="color:#0b766b">Cancelar inscrição</a></p>
            <p style="font-size:12px;color:#536762">Feito com café e JavaScript por Daniel Melo</p>
          </div>
        `
      });

      const acceptedCount = emailResult?.accepted?.length || 0;
      if (!acceptedCount) {
        throw Object.assign(new Error('O servidor SMTP não aceitou o destinatário.'), {
          code: 'SMTP_NO_ACCEPTED_RECIPIENTS'
        });
      }
      recipients += acceptedCount;
    }

    await NewsDelivery.insertMany(
      newStories.map(story => ({ newsKey: getNewsKey(story), sentAt: new Date() })),
      { ordered: false }
    );

    return {
      sent: true,
      editionDate: latestEditionDate,
      newStories: newStories.length,
      recipients
    };
  } catch (error) {
    console.error('Erro ao enviar atualizações:', error);
    throw error;
  }
};


async function runAndRecord(req, trigger = 'notify-news') {
  const { connectDatabase } = require('../lib/db');
  const NewsletterRun = require('../lib/newsletter-run');
  const News = require('../lib/news');
  await connectDatabase();
  await NewsletterRun.createIndexes();

  const staleBefore = new Date(Date.now() - 45 * 60 * 1000);
  await NewsletterRun.updateMany({
    status: 'running',
    startedAt: { $lt: staleBefore }
  }, {
    $set: { status: 'failed', completedAt: new Date(), errorCode: 'RUN_TIMEOUT' }
  });

  const editionRows = await News.find().select('editionDate').lean();
  const parseEditionDate = value => {
    const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : 0;
  };
  const editionDate = editionRows
    .sort((a, b) => parseEditionDate(b.editionDate) - parseEditionDate(a.editionDate))[0]?.editionDate || null;

  let run;
  try {
    run = await NewsletterRun.create({ status: 'running', trigger, editionDate, startedAt: new Date() });
  } catch (error) {
    if (error.code === 11000) {
      throw Object.assign(new Error('Já existe um disparo em andamento.'), { code: 'NEWSLETTER_RUN_ACTIVE' });
    }
    throw error;
  }

  try {
    const result = await notifyLatestNews(req);
    await NewsletterRun.updateOne({ _id: run._id }, {
      $set: {
        status: result.sent ? 'succeeded' : 'skipped',
        completedAt: new Date(),
        editionDate: result.editionDate || null,
        newStories: result.newStories || 0,
        recipients: result.recipients || 0
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

  if (!process.env.NOTIFY_SECRET || req.headers.authorization !== `Bearer ${process.env.NOTIFY_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const result = await runAndRecord(req, 'notify-news');
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'NEWSLETTER_RUN_ACTIVE') {
      return res.status(409).json({ error: 'Já existe um disparo em andamento.' });
    }
    console.error('Erro ao enviar atualizações:', error);
    return res.status(500).json({ error: 'Não foi possível enviar as atualizações.' });
  }
};

module.exports.notifyLatestNews = notifyLatestNews;
module.exports.runAndRecord = runAndRecord;
