const crypto = require('node:crypto');
const DailyDigest = require('./daily-digest');
const Subscriber = require('./subscriber');
const RecipientNewsDelivery = require('./recipient-news-delivery');
const { sendEmail } = require('./email');
const { createToken, hashToken } = require('./tokens');
const { getAppUrl } = require('./app-url');
const { renderDigestEmail, formatEditionDate } = require('./digest-email');
const { digestDateKey, isDigestDue, editionKey, editionDateVariants } = require('./digest-schedule');
const { getWorkerSchedule } = require('./worker-schedule');
const { getEmailBanner } = require('./newsletter-settings');

const STALE_SENDING_MS = 45 * 60 * 1000;
const AMBIGUOUS_CODES = new Set([
  'ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNRESET',
  'ECONNABORTED', 'EPIPE', 'EAI_AGAIN', 'ESERVERTIMEOUT'
]);

function safeCode(error, fallback) {
  const raw = error && (error.code || error.name) || fallback;
  return /^[A-Z0-9_]+$/.test(String(raw)) ? String(raw) : fallback;
}

function digestNewsKey(digest) {
  return 'digest:' + editionKey(digest.editionDate);
}

// Keyed by date (not digest id) so a subscriber never receives two digests
// for the same day, even if a second document for that date is approved.
function digestDeliveryKey(digest, subscriberId) {
  return crypto.createHash('sha256')
    .update('digest\u0000' + editionKey(digest.editionDate) + '\u0000' + String(subscriberId))
    .digest('hex');
}

async function reserveDelivery(digest, subscriber) {
  const deliveryKey = digestDeliveryKey(digest, subscriber._id);
  try {
    await RecipientNewsDelivery.create({
      deliveryKey,
      newsKey: digestNewsKey(digest),
      editionDate: digest.editionDate,
      subscriberId: String(subscriber._id),
      subscriberEmail: subscriber.email,
      status: 'sending',
      attempts: 1,
      startedAt: new Date()
    });
    return { deliveryKey, reserved: true };
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
      { $set: { status: 'sending', startedAt: new Date(), sentAt: null, errorCode: null }, $inc: { attempts: 1 } }
    );
    if (retry.modifiedCount === 1) return { deliveryKey, reserved: true };
    existing = await RecipientNewsDelivery.findOne({ deliveryKey }).lean();
  }

  // A record stuck in "sending" means a previous run died after reserving it;
  // SMTP may or may not have accepted it, so quarantine instead of resending.
  if (existing && existing.status === 'sending' && existing.startedAt &&
      new Date(existing.startedAt).getTime() < Date.now() - STALE_SENDING_MS) {
    await RecipientNewsDelivery.updateOne(
      { deliveryKey, status: 'sending', startedAt: existing.startedAt },
      { $set: { status: 'unknown', errorCode: 'DELIVERY_OUTCOME_UNKNOWN' } }
    );
  }

  return { deliveryKey, reserved: false };
}

async function markDelivery(deliveryKey, fields) {
  await RecipientNewsDelivery.updateOne({ deliveryKey, status: 'sending' }, { $set: fields }).catch(() => {});
}

async function ensureUnsubscribeToken(subscriber) {
  if (subscriber.unsubscribeTokenHash) return subscriber.unsubscribeTokenHash;
  const token = hashToken(createToken());
  await Subscriber.updateOne({ _id: subscriber._id }, { $set: { unsubscribeTokenHash: token } });
  return token;
}

/** Sends one approved digest to every confirmed subscriber not yet served. */
async function deliverDigest(digest, subscribers, appUrl, banner) {
  let recipients = 0;
  let failedRecipients = 0;

  for (const subscriber of subscribers) {
    let reservation;
    try {
      reservation = await reserveDelivery(digest, subscriber);
    } catch (error) {
      failedRecipients += 1;
      console.error(JSON.stringify({ event: 'digest.recipient.failed', code: safeCode(error, 'DELIVERY_RESERVATION_FAILED') }));
      continue;
    }
    if (!reservation.reserved) continue;

    try {
      const unsubscribeToken = await ensureUnsubscribeToken(subscriber);
      const email = renderDigestEmail(digest, {
        appUrl,
        unsubscribeUrl: appUrl + '/api/unsubscribe?token=' + unsubscribeToken,
        mode: 'subscriber',
        banner
      });
      await sendEmail({ kind: 'newsletter', to: subscriber.email, subject: email.subject, html: email.html, text: email.text });
    } catch (error) {
      const status = AMBIGUOUS_CODES.has(String(error?.code || '').toUpperCase()) ? 'unknown' : 'failed';
      await markDelivery(reservation.deliveryKey, { status, errorCode: safeCode(error, 'EMAIL_DELIVERY_ERROR') });
      failedRecipients += 1;
      console.error(JSON.stringify({ event: 'digest.recipient.failed', code: safeCode(error, 'EMAIL_DELIVERY_ERROR') }));
      continue;
    }

    // If this write fails after SMTP accepted, the record stays "sending" and
    // the next run quarantines it as "unknown" rather than resending.
    await RecipientNewsDelivery.updateOne(
      { deliveryKey: reservation.deliveryKey, status: 'sending' },
      { $set: { status: 'sent', sentAt: new Date(), errorCode: null } }
    );
    recipients += 1;
  }

  return { recipients, failedRecipients };
}

async function finalizeDigest(digest) {
  const newsKey = digestNewsKey(digest);
  const [sentCount, failedCount] = await Promise.all([
    RecipientNewsDelivery.countDocuments({ newsKey, status: 'sent' }),
    RecipientNewsDelivery.countDocuments({ newsKey, status: { $in: ['failed', 'unknown'] } })
  ]);
  const status = failedCount > 0 ? 'failed' : 'sent';
  await DailyDigest.updateOne({ _id: digest._id, status: 'sending' }, {
    $set: {
      status,
      sentAt: status === 'sent' ? new Date() : null,
      'delivery.sentCount': sentCount,
      'delivery.failedCount': failedCount,
      'delivery.lastErrorCode': failedCount > 0 ? 'RECIPIENT_DELIVERY_FAILED' : null
    }
  });
  return { status, sentCount, failedCount };
}

/**
 * Sends every digest an admin approved (and resumes any interrupted send).
 * Drafts are never sent: approval is the only way a digest reaches readers.
 */
async function sendApprovedDigests() {
  const digests = await DailyDigest.find({ status: { $in: ['approved', 'sending'] } })
    .sort({ createdAt: 1 }).lean();
  const summary = { sent: false, editionDate: null, newStories: 0, recipients: 0, failedRecipients: 0, digests: 0 };
  if (!digests.length) return summary;

  const subscribers = await Subscriber.find({ confirmed: true }).lean();
  const appUrl = getAppUrl();
  const banner = await getEmailBanner();

  for (const digest of digests) {
    if (digest.status === 'approved') {
      const claimed = await DailyDigest.updateOne(
        { _id: digest._id, status: 'approved' },
        { $set: { status: 'sending', sendStartedAt: new Date() } }
      );
      if (claimed.modifiedCount !== 1) continue;
    }

    const result = await deliverDigest(digest, subscribers, appUrl, banner);
    await finalizeDigest(digest);

    summary.digests += 1;
    summary.editionDate = formatEditionDate(digest.editionDate);
    summary.newStories += renderDigestEmail(digest).storyCount;
    summary.recipients += result.recipients;
    summary.failedRecipients += result.failedRecipients;
    if (result.recipients > 0) summary.sent = true;
  }

  return summary;
}

/**
 * Once today's configured send time has passed, today's digest is approved
 * automatically (even if still a draft) and every approved digest is sent.
 */
async function sendScheduledDigests(now = new Date()) {
  const schedule = await getWorkerSchedule();
  if (schedule.enabled && isDigestDue(schedule.digestSendTime, now)) {
    await DailyDigest.updateMany(
      { editionDate: { $in: editionDateVariants(digestDateKey(now)) }, status: 'draft' },
      { $set: { status: 'approved', approvedAt: now, approvedBy: 'schedule' } }
    );
  }
  return sendApprovedDigests();
}

module.exports = { sendApprovedDigests, sendScheduledDigests, digestDeliveryKey, digestNewsKey };
