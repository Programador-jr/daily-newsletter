const mongoose = require('mongoose');

const workerControlSchema = new mongoose.Schema({
  _id: { type: String, default: 'newsletter' },
  intervalHours: { type: Number, min: 1, max: 168, default: 3 },
  enabled: { type: Boolean, default: true },
  revision: { type: Number, default: 1 },
  scheduleHistory: [{
    fromIntervalHours: { type: Number, min: 1, max: 168 },
    fromEnabled: { type: Boolean },
    intervalHours: { type: Number, min: 1, max: 168 },
    enabled: { type: Boolean },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, maxlength: 40, default: 'admin' }
  }],
  workerId: { type: String, default: null },
  lastHeartbeatAt: { type: Date, default: null },
  workerEnabled: { type: Boolean, default: false },
  workerRunning: { type: Boolean, default: false },
  lastRunAt: { type: Date, default: null },
  nextRunAt: { type: Date, default: null },
  lastRunStatus: { type: String, enum: ['running', 'succeeded', 'skipped', 'failed', null], default: null },
  lastRunErrorCode: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.WorkerControl || mongoose.model('WorkerControl', workerControlSchema);
