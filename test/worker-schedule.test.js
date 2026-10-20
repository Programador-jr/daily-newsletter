const assert = require('node:assert/strict');
const { test } = require('node:test');

const modelPath = require.resolve('../lib/worker-control-model');
const schedulePath = require.resolve('../lib/worker-schedule');
const originalModel = require.cache[modelPath];
const originalSchedule = require.cache[schedulePath];
let update;

require.cache[modelPath] = {
  id: modelPath,
  filename: modelPath,
  loaded: true,
  exports: {
    findOneAndUpdate(_filter, updateDocument) {
      update = updateDocument;
      return { lean: async () => ({ _id: 'newsletter', ...updateDocument.$set }) };
    }
  }
};
delete require.cache[schedulePath];
const { recordWorkerHeartbeat } = require('../lib/worker-schedule');

if (originalModel) require.cache[modelPath] = originalModel;
else delete require.cache[modelPath];
if (originalSchedule) require.cache[schedulePath] = originalSchedule;
else delete require.cache[schedulePath];

test('worker heartbeat clears stale run state when the worker reports no local run', async () => {
  const now = new Date();
  await recordWorkerHeartbeat({
    workerId: 'worker-id-12345678',
    enabled: true,
    running: false,
    nextRunAt: null,
    lastRunAt: null,
    lastRunStatus: null,
    lastRunErrorCode: null
  }, now);

  assert.equal(update.$set.lastRunAt, null);
  assert.equal(update.$set.lastRunStatus, null);
  assert.equal(update.$set.lastRunErrorCode, null);
  assert.equal(update.$set.lastHeartbeatAt, now);
});
