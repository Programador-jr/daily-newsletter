// Daily digest timing. America/Rio_Branco has no DST, so it is always UTC-5.
const DIGEST_TIMEZONE = 'America/Rio_Branco';
const DIGEST_UTC_OFFSET = '-05:00';
const SEND_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const { calendarDateKey } = require('./news-date');

function isValidSendTime(value) {
  return typeof value === 'string' && SEND_TIME_PATTERN.test(value);
}

/** Calendar date (YYYY-MM-DD) in the digest timezone. */
function digestDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: DIGEST_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function sendInstantFor(dateKey, sendTime) {
  return new Date(`${dateKey}T${sendTime}:00${DIGEST_UTC_OFFSET}`);
}

/** Next moment the daily digest is due, or null when no time is configured. */
function nextDigestSendAt(sendTime, now = new Date()) {
  if (!isValidSendTime(sendTime)) return null;
  const today = sendInstantFor(digestDateKey(now), sendTime);
  if (today.getTime() > now.getTime()) return today;
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

/** True once today's configured send time has passed. */
function isDigestDue(sendTime, now = new Date()) {
  if (!isValidSendTime(sendTime)) return false;
  return now.getTime() >= sendInstantFor(digestDateKey(now), sendTime).getTime();
}

/** Normalizes a digest editionDate (YYYY-MM-DD or DD/MM/YYYY) to YYYY-MM-DD. */
function editionKey(editionDate) {
  return calendarDateKey(String(editionDate || '')) || String(editionDate || '');
}

/** Both spellings of a calendar day, for querying editionDate in either format. */
function editionDateVariants(dateKey) {
  const [year, month, day] = String(dateKey).split('-');
  return [dateKey, `${day}/${month}/${year}`];
}

module.exports = { DIGEST_TIMEZONE, isValidSendTime, digestDateKey, nextDigestSendAt, isDigestDue, editionKey, editionDateVariants };
