function getNewsKey(story) {
  return story.url || `${story.editionDate || ''}|${story.title || ''}`;
}

function buildLatestEditionMetrics({
  editionDate = null,
  stories = [],
  deliveredKeys = [],
  lastRun = null,
  activeRun = null,
  now = Date.now()
}) {
  if (!editionDate) {
    return {
      date: null, totalStories: 0, deliveredStories: 0, pendingStories: 0,
      status: 'no_news', lastRun: null
    };
  }

  const delivered = new Set(deliveredKeys);
  const keys = stories.map(getNewsKey);
  const deliveredStories = keys.filter(key => delivered.has(key)).length;
  const pendingStories = keys.length - deliveredStories;
  const activeRunIsFresh = activeRun &&
    now - new Date(activeRun.startedAt).getTime() < 45 * 60 * 1000;
  const displayLastRun = lastRun?.status === 'running' && !activeRunIsFresh
    ? { ...lastRun, status: 'failed', errorCode: 'RUN_TIMEOUT' }
    : lastRun;

  let status = 'pending';
  if (pendingStories === 0) status = 'delivered';
  else if (activeRunIsFresh) status = 'sending';
  else if (displayLastRun?.status === 'failed') status = 'failed';
  else if (displayLastRun?.status === 'skipped' && displayLastRun.recipients === 0) status = 'no_recipients';

  return {
    date: editionDate,
    totalStories: keys.length,
    deliveredStories,
    pendingStories,
    status,
    lastRun: activeRunIsFresh ? activeRun : displayLastRun
  };
}

module.exports = { buildLatestEditionMetrics, getNewsKey };
