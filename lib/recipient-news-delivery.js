const mongoose = require('mongoose');

const recipientNewsDeliverySchema = new mongoose.Schema(
  {
    deliveryKey: {
      type: String,
      required: true,
      unique: true
    },
    newsKey: {
      type: String,
      required: true,
      index: true
    },
    editionDate: {
      type: String,
      required: true
    },
    subscriberId: {
      type: String,
      required: true
    },
    subscriberEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'failed', 'unknown'],
      required: true,
      default: 'sending'
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    sentAt: {
      type: Date,
      default: null
    },
    errorCode: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

recipientNewsDeliverySchema.index({ subscriberId: 1, status: 1 });

module.exports =
  mongoose.models.RecipientNewsDelivery ||
  mongoose.model('RecipientNewsDelivery', recipientNewsDeliverySchema);
