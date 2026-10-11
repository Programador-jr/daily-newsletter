const mongoose = require('mongoose');

const adminUpdateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, maxlength: 4000 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  maxDisplays: { type: Number, required: true, min: 1, max: 20, default: 2 },
  active: { type: Boolean, default: false },
  activationId: { type: String, required: true }
}, { timestamps: true });

adminUpdateSchema.index({ active: 1, startsAt: 1, endsAt: 1, updatedAt: -1 });

module.exports = mongoose.models.AdminUpdate || mongoose.model('AdminUpdate', adminUpdateSchema);
