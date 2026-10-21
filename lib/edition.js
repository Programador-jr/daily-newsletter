const mongoose = require('mongoose');

const editionSchema = new mongoose.Schema({
  editionDate: { type: String, required: true, unique: true, match: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/ },
  issueNumber: { type: Number, required: true, unique: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.models.Edition || mongoose.model('Edition', editionSchema);
