const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, match: /^https:\/\// },
    alt: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] },
    mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] },
    source: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true, match: /^https:\/\// },
    credit: { type: String, required: true, trim: true },
    attribution: { type: String, required: true, trim: true },
    license: { type: String, required: true, trim: true },
    licenseUrl: { type: String, required: true, trim: true, match: /^https:\/\// },
    terms: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    kind: { type: String, required: true, enum: ['original', 'contextual_archive', 'illustrative_archive', 'contextual_map'] },
    storage: { type: String, required: true, enum: ['external'], default: 'external' },
    licenseVerified: { type: Boolean, required: true, default: false },
    urlVerified: { type: Boolean, required: true, default: false },
    isOriginal: { type: Boolean, default: false },
    isContextual: { type: Boolean, default: true },
    isArchive: { type: Boolean, default: false },
    checkedAt: { type: Date, required: true }
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    editionDate: { type: String, required: true, match: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/ },
    category: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    context: { type: String, required: true },
    source: { type: String, required: true, trim: true },
    publishedAt: { type: String, required: true },
    url: { type: String, required: true, trim: true },
    headline: { type: Boolean, default: false },
    image: { type: imageSchema, required: true }
  },
  { timestamps: true }
);

newsSchema.index({ editionDate: -1, publishedAt: -1, _id: 1 });
newsSchema.index({ editionDate: 1, url: 1 }, { unique: true });

module.exports = mongoose.models.News || mongoose.model('News', newsSchema);
