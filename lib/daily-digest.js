const mongoose = require('mongoose');

const DIGEST_STATUSES = ['draft', 'approved', 'sending', 'sent', 'failed'];

const digestStorySchema = new mongoose.Schema({
  newsId: { type: String, default: null },
  editorialRank: { type: Number, default: null },
  category: { type: String, default: '', trim: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, default: '' },
  context: { type: String, default: '' },
  source: { type: String, default: '', trim: true },
  articleUrl: { type: String, default: '', trim: true },
  image: {
    url: { type: String, trim: true },
    alt: { type: String, trim: true }
  }
}, { _id: false, strict: false });

const dailyDigestSchema = new mongoose.Schema({
  // Calendar date in the digest timezone: DD/MM/YYYY (like news) or YYYY-MM-DD.
  editionDate: { type: String, required: true, match: /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/ },
  timezone: { type: String, default: 'America/Rio_Branco' },
  status: { type: String, enum: DIGEST_STATUSES, default: 'draft' },
  subject: { type: String, required: true, trim: true },
  preheader: { type: String, default: '', trim: true },
  headline: { type: String, default: '', trim: true },
  stories: { type: [digestStorySchema], default: [] },
  storyCount: { type: Number, default: 0 },
  // A string (one item per line) or an array of strings.
  watchNext: { type: mongoose.Schema.Types.Mixed, default: null },
  editorialNotes: { type: String, default: '' },
  htmlSnapshot: { type: String, default: '' },
  textSnapshot: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: String, default: null },
  sendStartedAt: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  delivery: {
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    lastErrorCode: { type: String, default: null }
  }
}, { timestamps: true, strict: false, collection: 'dailydigests' });

// Mirrors the indexes that already exist in the collection; changing their
// options here would make Mongoose fail to build them on connect.
dailyDigestSchema.index({ editionDate: 1 });
dailyDigestSchema.index({ status: 1 });

module.exports = mongoose.models.DailyDigest || mongoose.model('DailyDigest', dailyDigestSchema, 'dailydigests');
module.exports.DIGEST_STATUSES = DIGEST_STATUSES;
