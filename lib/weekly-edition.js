const mongoose = require('mongoose');

const weeklyStorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, default: '' },
  context: { type: String, default: '' },
  source: { type: String, default: '', trim: true },
  url: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '', trim: true }
}, { _id: false });

const weeklySectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  intro: { type: String, default: '' },
  stories: { type: [weeklyStorySchema], default: [] }
}, { _id: false });

const weeklyEditionSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  editionNumber: { type: Number, min: 1, unique: true, sparse: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  intro: { type: String, default: '' },
  sections: { type: [weeklySectionSchema], default: [] },
  analysis: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

weeklyEditionSchema.index({ status: 1, weekStart: -1, publishedAt: -1 });

module.exports = mongoose.models.WeeklyEdition || mongoose.model('WeeklyEdition', weeklyEditionSchema, 'weekly_editions');
