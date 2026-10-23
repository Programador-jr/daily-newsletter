const { connectDatabase } = require('../lib/db');
const News = require('../lib/news');
const Subscriber = require('../lib/subscriber');
const NewsDelivery = require('../lib/news-delivery');
const RecipientNewsDelivery = require('../lib/recipient-news-delivery');
const crypto = require('node:crypto');
const { sendEmail } = require('../lib/email');
const { createToken, hashToken } = require('../lib/tokens');
const { getAppUrl } = require('../lib/app-url');
 
function getNewsKey(story) {
  return story.url || `${story.editionDate || ''}|${story.title || ''}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function notifyLatestNews() {
  try {
    await connectDatabase();

    const latest = await News.find().select('editionDate').lean();
    if (!latest.length) {
      return { sent: false, editionDate: null, newStories: 0, recipients: 0, failedRecipients: 0 };
    }

    const parseDate = value => {
      const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return 0;
      const timestamp = Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      const date = new Date(timestamp);
      return date.getUTCFullYear() === Number(match[3]) &&
        date.getUTCMonth() === Number(match[2]) - 1 &&
        date.getUTCDate() === Number(match[1]) ? timestamp : 0;
    };

    const latestEditionDate = latest
      .sort((a, b) => parseDate(b.editionDate) - parseDate(a.editionDate))[0]
      .editionDate;

    // Include every story assigned to the latest edition, even when publishedAt is earlier.
    const stories = await News.find({ editionDate: latestEditionDate }).lean();
    stories.sort((a, b) => {
      const headlineDifference = Number(Boolean(b.headline)) - Number(Boolean(a.headline));
      const publishedDifference = parseDate(b.publishedAt) - parseDate(a.publishedAt);
      return headlineDifference || publishedDifference || String(a._id).localeCompare(String(b._id));
    });

    const keys = stories.map(getNewsKey);
    const legacyDeliveries = await NewsDelivery.find({ newsKey: { $in: keys } })
      .select('newsKey')
      .lean();
    // Old records were written only after the old process completed its full
    // subscriber loop, so they remain a compatibility signal for previous sends.
    const legacyDeliveredKeys = new Set(legacyDeliveries.map(item => item.newsKey));
    const eligibleStories = stories.filter(story => !legacyDeliveredKeys.has(getNewsKey(story)));

    if (!eligibleStories.length) {
      return { sent: false, editionDate: latestEditionDate, newStories: 0, recipients: 0, failedRecipients: 0 };
    }

    const subscribers = await Subscriber.find({ confirmed: true }).lean();
    if (!subscribers.length) {
      return { sent: false, editionDate: latestEditionDate, newStories: eligibleStories.length, recipients: 0, failedRecipients: 0 };
    }

    const appUrl = getAppUrl();
    const sentStoryKeys = new Set();
    let recipients = 0;
    let failedRecipients = 0;

    const isAmbiguousDeliveryError = error => {
      const code = String(error && error.code || '').toUpperCase();
      return [
        'ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNRESET',
        'ECONNABORTED', 'EPIPE', 'EAI_AGAIN', 'ESERVERTIMEOUT'
      ].includes(code);
    };

    function logRecipientFailure(error) {
      const rawCode = error && (error.code || error.name) || 'RECIPIENT_DELIVERY_FAILED';
      const errorCode = /^[A-Z0-9_]+$/.test(rawCode) ? rawCode : 'RECIPIENT_DELIVERY_FAILED';
      console.error(JSON.stringify({ event: 'newsletter.recipient.failed', code: errorCode }));
    }

    async function reserveDelivery(story, subscriber) {
      const newsKey = getNewsKey(story);
      const deliveryKey = crypto.createHash('sha256')
        .update(String(latestEditionDate) + '\u0000' + newsKey + '\u0000' + String(subscriber._id))
        .digest('hex');
      const details = {
        deliveryKey,
        newsKey,
        editionDate: latestEditionDate,
        subscriberId: String(subscriber._id),
        subscriberEmail: subscriber.email
      };

      try {
        await RecipientNewsDelivery.create({
          ...details,
          status: 'sending',
          attempts: 1,
          startedAt: new Date()
        });
        return { ...details, reserved: true };
      } catch (error) {
        if (!error || error.code !== 11000) throw error;
      }

      let existing = await RecipientNewsDelivery.findOne({ deliveryKey }).lean();
      if (!existing) {
        throw Object.assign(new Error('Registro de entrega duplicado não pôde ser recuperado.'), {
          code: 'DELIVERY_RECORD_UNAVAILABLE'
        });
      }

      if (existing.status === 'failed') {
        const retry = await RecipientNewsDelivery.updateOne(
          { deliveryKey, status: 'failed' },
          {
            $set: { status: 'sending', startedAt: new Date(), sentAt: null, errorCode: null },
            $inc: { attempts: 1 }
          }
        );

        if (retry.modifiedCount === 1) return { ...details, reserved: true };
        existing = await RecipientNewsDelivery.findOne({ deliveryKey }).lean();
      }

      if (existing && existing.status === 'sending' &&
          existing.startedAt &&
          new Date(existing.startedAt).getTime() < Date.now() - 45 * 60 * 1000) {
        await RecipientNewsDelivery.updateOne(
          { deliveryKey, status: 'sending', startedAt: existing.startedAt },
          { $set: { status: 'unknown', errorCode: 'DELIVERY_OUTCOME_UNKNOWN' } }
        );
      }

      return { ...details, reserved: false, status: existing && existing.status || 'unknown' };
    }

    for (const subscriber of subscribers) {
      const reservations = [];

      try {
        for (const story of eligibleStories) {
          const reservation = await reserveDelivery(story, subscriber);
          if (reservation.reserved) reservations.push({ story, ...reservation });
        }
      } catch (error) {
        await RecipientNewsDelivery.updateMany(
          {
            deliveryKey: { $in: reservations.map(item => item.deliveryKey) },
            status: 'sending'
          },
          { $set: { status: 'failed', errorCode: 'DELIVERY_RESERVATION_FAILED' } }
        ).catch(() => {});
        failedRecipients += 1;
        logRecipientFailure(error);
        continue;
      }

      if (!reservations.length) continue;

      let unsubscribeToken = subscriber.unsubscribeTokenHash;
      try {
        if (!unsubscribeToken) {
          unsubscribeToken = hashToken(createToken());
          await Subscriber.updateOne(
            { _id: subscriber._id },
            { $set: { unsubscribeTokenHash: unsubscribeToken } }
          );
        }
      } catch (error) {
        const rawCode = error && (error.code || error.name) || 'DELIVERY_PREPARATION_FAILED';
        const errorCode = /^[A-Z0-9_]+$/.test(rawCode) ? rawCode : 'DELIVERY_PREPARATION_FAILED';
        await RecipientNewsDelivery.updateMany(
          { deliveryKey: { $in: reservations.map(item => item.deliveryKey) }, status: 'sending' },
          { $set: { status: 'failed', errorCode } }
        ).catch(() => {});
        failedRecipients += 1;
        logRecipientFailure(error);
        continue;
      }

      const unsubscribeUrl = appUrl + '/api/unsubscribe?token=' + unsubscribeToken;
      const reservedStories = reservations.map(item => item.story);
      const items = reservedStories.map(story => {
        const imageUrl = typeof story.image?.url === 'string' && /^https:\/\//i.test(story.image.url)
          ? story.image.url
          : '';
        const imageAlt = escapeHtml(story.image?.alt || story.title || 'Imagem da notícia');
        const imageMarkup = imageUrl
          ? '<img src="' + escapeHtml(imageUrl) + '" alt="' + imageAlt + '" width="616" style="display:block;width:100%;max-width:616px;height:auto;object-fit:contain;border:0;margin:0 0 18px" />'
          : '';

        return '<article style="padding:0 0 24px;margin:0 0 24px;border-bottom:1px solid #d8e5e1">' +
          imageMarkup +
          '<div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#0b766b;letter-spacing:.5px">' + escapeHtml(story.category || '') + '</div>' +
          '<h2 style="font-family:Georgia,serif;font-size:21px;line-height:1.25;margin:8px 0">' + escapeHtml(story.title || '') + '</h2>' +
          '<p style="line-height:1.6;color:#536762">' + escapeHtml(story.summary || '') + '</p>' +
          '<p style="line-height:1.6"><strong>Contexto:</strong> ' + escapeHtml(story.context || '') + '</p>' +
          '<a href="' + escapeHtml(story.url || '#') + '" style="color:#0b766b;font-weight:bold">Ler fonte</a>' +
        '</article>';
      }).join('');

      const textItems = reservedStories.map(story =>
        (story.title || '') + '\n' + (story.summary || '') + '\nContexto: ' +
        (story.context || '') + '\nFonte: ' + (story.url || '')
      ).join('\n\n');

      let emailResult;
      try {
        emailResult = await sendEmail({
          kind: 'newsletter',
          to: subscriber.email,
          subject: 'Novas atualizações — ' + latestEditionDate,
          text: "King's Newsletter\n\nNovas atualizações — " + latestEditionDate + '\n\n' +
            textItems + '\n\nCancelar inscrição: ' + unsubscribeUrl,
          html: '<div style="font-family:Arial,sans-serif;width:100%;max-width:680px;margin:0 auto;padding:32px;box-sizing:border-box;color:#1c2d2a;background:#ffffff">' +
            '<div style="background:#064e46;padding:12px 16px;margin:0 0 16px;border-bottom:3px solid #f5c518">' +
              '<img src="https://cdn.shardcloud.app/4d7d8031-4b99-4759-afbc-1e01575b29d6/kingsNewsletter.png" alt="King\'s Newsletter" width="220" style="display:block;width:100%;max-width:220px;height:auto;border:0" />' +
            '</div>' +
            '<p style="color:#536762">Novas atualizações — ' + escapeHtml(latestEditionDate) + '</p>' +
            items +
            '<p style="font-size:13px;color:#536762">Você está recebendo este e-mail porque confirmou sua inscrição.</p>' +
            '<p style="font-size:13px"><a href="' + unsubscribeUrl + '" style="color:#0b766b">Cancelar inscrição</a></p>' +
            '<p style="font-size:12px;color:#536762;text-align:center;margin:24px 0 0">Feito com café e JavaScript por Daniel Melo</p>' +
            '</div>'
        });
      } catch (error) {
        const status = isAmbiguousDeliveryError(error) ? 'unknown' : 'failed';
        const rawCode = error && (error.code || error.name) || 'EMAIL_DELIVERY_ERROR';
        const errorCode = /^[A-Z0-9_]+$/.test(rawCode) ? rawCode : 'EMAIL_DELIVERY_ERROR';
        await RecipientNewsDelivery.updateMany(
          { deliveryKey: { $in: reservations.map(item => item.deliveryKey) }, status: 'sending' },
          { $set: { status, errorCode } }
        ).catch(() => {});
        failedRecipients += 1;
        logRecipientFailure(error);
        continue;
      }

      const acceptedCount = emailResult && emailResult.accepted && emailResult.accepted.length || 0;
      if (!acceptedCount) {
        await RecipientNewsDelivery.updateMany(
          { deliveryKey: { $in: reservations.map(item => item.deliveryKey) }, status: 'sending' },
          { $set: { status: 'failed', errorCode: 'SMTP_NO_ACCEPTED_RECIPIENTS' } }
        );
        failedRecipients += 1;
        logRecipientFailure({ code: 'SMTP_NO_ACCEPTED_RECIPIENTS' });
        continue;
      }

      // If this persistence step fails after SMTP accepted the email, leave records
      // as "sending"; the next run quarantines stale records instead of resending.
      await RecipientNewsDelivery.updateMany(
        { deliveryKey: { $in: reservations.map(item => item.deliveryKey) }, status: 'sending' },
        { $set: { status: 'sent', sentAt: new Date(), errorCode: null } }
      );

      for (const item of reservations) sentStoryKeys.add(item.newsKey);
      recipients += 1;
    }

    return {
      sent: sentStoryKeys.size > 0,
      editionDate: latestEditionDate,
      newStories: sentStoryKeys.size,
      recipients,
      failedRecipients
    };
  } catch (error) {
    console.error('Erro ao enviar atualizações:', error);
    throw error;
  }
}

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

  if (!process.env.NOTIFY_SECRET || req.headers.authorization !== `Bearer ${process.env.NOTIFY_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const result = await runAndRecord(req, 'notify-news');
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === 'NEWSLETTER_RUN_ACTIVE') {
      // A concurrent run is a safe no-op for the scheduled worker.
      // Return success so expected overlap is not recorded as a worker failure.
      return res.status(200).json({ sent: false, skipped: true, reason: 'run_active', newStories: 0, recipients: 0, failedRecipients: 0 });
    }
    console.error('Erro ao enviar atualizações:', error);
    return res.status(500).json({ error: 'Não foi possível enviar as atualizações.' });
  }
};

module.exports.notifyLatestNews = notifyLatestNews;
module.exports.runAndRecord = runAndRecord;
