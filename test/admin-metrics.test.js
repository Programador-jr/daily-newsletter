const assert = require('node:assert/strict');
const { test } = require('node:test');
const { buildLatestEditionMetrics } = require('../lib/admin-metrics');

const stories = [
  { editionDate: '10/10/2026', url: 'https://example.com/one' },
  { editionDate: '10/10/2026', url: 'https://example.com/two' },
  { editionDate: '10/10/2026', url: 'https://example.com/three' }
];

test('latest edition counts total, delivered, and pending news from delivery records', () => {
  const result = buildLatestEditionMetrics({
    editionDate: '10/10/2026',
    stories,
    deliveredKeys: ['https://example.com/one', 'https://example.com/two']
  });

  assert.equal(result.totalStories, 3);
  assert.equal(result.deliveredStories, 2);
  assert.equal(result.pendingStories, 1);
  assert.equal(result.status, 'pending');
});

test('latest edition reports delivery failure and active dispatch accurately', () => {
  const now = Date.UTC(2026, 9, 10, 12);
  const failed = buildLatestEditionMetrics({
    editionDate: '10/10/2026', stories, deliveredKeys: [],
    lastRun: { status: 'failed', recipients: 1 }
  });
  const sending = buildLatestEditionMetrics({
    editionDate: '10/10/2026', stories, deliveredKeys: [], now,
    activeRun: { status: 'running', startedAt: new Date(now - 60_000) }
  });

  assert.equal(failed.status, 'failed');
  assert.equal(sending.status, 'sending');
});

test('a stale running dispatch is shown as timed out and a completed edition as delivered', () => {
  const now = Date.UTC(2026, 9, 10, 12);
  const stale = buildLatestEditionMetrics({
    editionDate: '10/10/2026', stories, deliveredKeys: [], now,
    lastRun: { status: 'running', startedAt: new Date(now - 60 * 60 * 1000) }
  });
  const delivered = buildLatestEditionMetrics({
    editionDate: '10/10/2026', stories,
    deliveredKeys: stories.map(story => story.url),
    lastRun: { status: 'succeeded' }
  });

  assert.equal(stale.status, 'failed');
  assert.equal(stale.lastRun.errorCode, 'RUN_TIMEOUT');
  assert.equal(delivered.status, 'delivered');
  assert.equal(delivered.pendingStories, 0);
});

test('missing latest edition is represented with zero news and no-news status', () => {
  assert.deepEqual(buildLatestEditionMetrics({}), {
    date: null, totalStories: 0, deliveredStories: 0, pendingStories: 0,
    status: 'no_news', lastRun: null
  });
});
