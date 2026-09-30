const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmationTokenHash: {
      type: String,
      default: null
    },
    confirmationTokenExpiresAt: {
      type: Date,
      default: null
    },
    unsubscribeTokenHash: {
      type: String,
      default: null
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    confirmedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Subscriber ||
  mongoose.model('Subscriber', subscriberSchema);
