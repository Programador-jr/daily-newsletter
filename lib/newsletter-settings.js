const mongoose = require('mongoose');

const SETTINGS_KEY = 'email';
const DEFAULT_BANNER_URL = 'https://cdn.shardcloud.app/4d7d8031-4b99-4759-afbc-1e01575b29d6/King_s_Newsletter_faixa_20261029_074825_0000.png';
const DEFAULT_BANNER_ALT = "King's Newsletter";

const newsletterSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_KEY },
  bannerUrl: { type: String, default: null, trim: true, maxlength: 2048 },
  bannerAlt: { type: String, default: null, trim: true, maxlength: 200 },
  bannerSource: { type: String, enum: ['link', 'upload', null], default: null },
  bannerUpdatedAt: { type: Date, default: null }
}, { timestamps: true, collection: 'newsletter_settings' });

const NewsletterSettings = mongoose.models.NewsletterSettings ||
  mongoose.model('NewsletterSettings', newsletterSettingsSchema, 'newsletter_settings');

/** Banner used by the digest email: the admin's choice or the default one. */
async function getEmailBanner() {
  const settings = await NewsletterSettings.findById(SETTINGS_KEY).lean();
  return {
    url: settings?.bannerUrl || DEFAULT_BANNER_URL,
    alt: settings?.bannerAlt || DEFAULT_BANNER_ALT,
    source: settings?.bannerUrl ? settings.bannerSource || 'link' : 'default',
    updatedAt: settings?.bannerUpdatedAt || null
  };
}

async function setEmailBanner({ url, alt, source }) {
  await NewsletterSettings.updateOne(
    { _id: SETTINGS_KEY },
    { $set: { bannerUrl: url, bannerAlt: alt || null, bannerSource: source, bannerUpdatedAt: new Date() } },
    { upsert: true }
  );
  return getEmailBanner();
}

async function resetEmailBanner() {
  await NewsletterSettings.updateOne(
    { _id: SETTINGS_KEY },
    { $set: { bannerUrl: null, bannerAlt: null, bannerSource: null, bannerUpdatedAt: new Date() } },
    { upsert: true }
  );
  return getEmailBanner();
}

module.exports = { NewsletterSettings, getEmailBanner, setEmailBanner, resetEmailBanner, DEFAULT_BANNER_URL, DEFAULT_BANNER_ALT };
