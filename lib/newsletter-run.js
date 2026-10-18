const mongoose = require('mongoose');

const newsletterRunSchema = new mongoose.Schema(
  {
    trigger: { type: String, enum: ['notify-news', 'admin-manual'], default: 'notify-news' },
    status: { type: String, enum: ['running', 'succeeded', 'skipped', 'failed'], required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
    editionDate: { type: String, default: null },
    newStories: { type: Number, default: 0, min: 0 },
    recipients: { type: Number, default: 0, min: 0 },
    failedRecipients: { type: Number, default: 0, min: 0 },
    errorCode: { type: String, default: null }
  },
  { timestamps: true }
);

newsletterRunSchema.index({ startedAt: -1 });
newsletterRunSchema.index(
  { status: 1 },
  { unique: true, partialFilterExpression: { status: 'running' } }
);

module.exports = mongoose.models.NewsletterRun || mongoose.model('NewsletterRun', newsletterRunSchema);
