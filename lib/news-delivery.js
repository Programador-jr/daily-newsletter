const mongoose = require('mongoose');

const newsDeliverySchema = new mongoose.Schema(
  {
    newsKey: {
      type: String,
      required: true,
      unique: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.NewsDelivery ||
  mongoose.model('NewsDelivery', newsDeliverySchema);
