const WorkerControl = require('./worker-control-model');

const SINGLETON_KEY = 'newsletter';
const DEFAULT_INTERVAL_HOURS = 3;
const HEARTBEAT_TTL_MS = 90_000;

function initialFields() {
  // The equality filter supplies _id on an upsert. Including it in $setOnInsert
  // can conflict with the filter's implicit _id update in MongoDB.
  return { intervalHours: DEFAULT_INTERVAL_HOURS, enabled: true, revision: 1 };
}

async function getWorkerSchedule() {
  return WorkerControl.findOneAndUpdate(
    { _id: SINGLETON_KEY },
    { $setOnInsert: initialFields() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
}

async function updateWorkerSchedule(intervalHours, enabled, changedBy = 'admin') {
  const previous = await getWorkerSchedule();
  if (previous.intervalHours === intervalHours && previous.enabled === enabled) return previous;
  return WorkerControl.findOneAndUpdate(
    { _id: SINGLETON_KEY },
    {
      $set: { intervalHours, enabled },
      $inc: { revision: 1 },
      $push: {
        scheduleHistory: {
          $each: [{
            fromIntervalHours: previous.intervalHours,
            fromEnabled: previous.enabled,
            intervalHours,
            enabled,
            changedAt: new Date(),
            changedBy
          }],
          $slice: -50
        }
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: false, runValidators: true }
  ).lean();
}

async function recordWorkerHeartbeat(payload, now = new Date()) {
  const fields = {
    lastHeartbeatAt: now,
    workerId: payload.workerId,
    workerEnabled: payload.enabled,
    workerRunning: payload.running,
    nextRunAt: payload.nextRunAt
  };
  if (payload.lastRunAt) fields.lastRunAt = payload.lastRunAt;
  if (payload.lastRunStatus) {
    fields.lastRunStatus = payload.lastRunStatus;
    fields.lastRunErrorCode = payload.lastRunErrorCode;
  }
  return WorkerControl.findOneAndUpdate(
    { _id: SINGLETON_KEY },
    { $set: fields, $setOnInsert: initialFields() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
}

function toAdminWorkerSchedule(record, now = Date.now()) {
  const lastHeartbeatAt = record?.lastHeartbeatAt || null;
  const online = Boolean(lastHeartbeatAt && now - new Date(lastHeartbeatAt).getTime() <= HEARTBEAT_TTL_MS);
  return {
    intervalHours: record?.intervalHours ?? DEFAULT_INTERVAL_HOURS,
    enabled: record?.enabled ?? true,
    revision: record?.revision ?? 1,
    workerOnline: online,
    workerEnabled: online && Boolean(record?.workerEnabled),
    workerRunning: online && Boolean(record?.workerRunning),
    lastHeartbeatAt,
    lastRunAt: record?.lastRunAt || null,
    nextRunAt: online && record?.enabled && record?.workerEnabled ? record.nextRunAt || null : null,
    lastRunStatus: record?.lastRunStatus || null,
    lastRunErrorCode: record?.lastRunErrorCode || null,
    scheduleHistory: Array.isArray(record?.scheduleHistory) ? record.scheduleHistory.slice(-20).reverse() : []
  };
}

module.exports = {
  DEFAULT_INTERVAL_HOURS,
  HEARTBEAT_TTL_MS,
  getWorkerSchedule,
  updateWorkerSchedule,
  recordWorkerHeartbeat,
  toAdminWorkerSchedule
};
