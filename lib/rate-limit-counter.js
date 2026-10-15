const mongoose = require('mongoose');

const rateLimitCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true }
  },
  {
    versionKey: false,
    collection: 'rate_limit_counters'
  }
);

rateLimitCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.RateLimitCounter ||
  mongoose.model('RateLimitCounter', rateLimitCounterSchema);
