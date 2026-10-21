const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Sequence || mongoose.model('Sequence', sequenceSchema);
