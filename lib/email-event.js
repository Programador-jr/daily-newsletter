const mongoose = require('mongoose');

const emailEventSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['subscription_confirmation', 'newsletter', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['accepted', 'partially_accepted', 'failed'],
      required: true
    },
    acceptedCount: { type: Number, default: 0, min: 0 },
    rejectedCount: { type: Number, default: 0, min: 0 },
    errorCode: { type: String, default: null }
  },
  { timestamps: true }
);

emailEventSchema.index({ createdAt: -1 });

module.exports = mongoose.models.EmailEvent || mongoose.model('EmailEvent', emailEventSchema);
