const mongoose = require('mongoose');

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
    headline: { type: Boolean, default: false }
  },
  { timestamps: true }
);

newsSchema.index({ editionDate: -1, publishedAt: -1, _id: 1 });
newsSchema.index({ url: 1 }, { unique: true });

module.exports = mongoose.models.News || mongoose.model('News', newsSchema);
