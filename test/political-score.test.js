const assert = require('node:assert/strict');
const test = require('node:test');

const zeroProfile = Array.from({ length: 12 }, () => 50);
const closeProfile = Array.from({ length: 12 }, () => 60);
const oppositeProfile = Array.from({ length: 12 }, () => 0);

async function loadScore() {
  return import('../scripts/lib/political-score.mjs');
}

test('matchScore returns 100 for identical vectors', async () => {
  const { matchScore } = await loadScore();

  assert.equal(matchScore(zeroProfile, zeroProfile), 100);
});

test('matchScore decreases as profiles diverge', async () => {
  const { matchScore } = await loadScore();

  assert.ok(matchScore(zeroProfile, closeProfile) > 80);
  assert.ok(matchScore(zeroProfile, oppositeProfile) < 40);
  assert.ok(matchScore(zeroProfile, oppositeProfile) < matchScore(zeroProfile, closeProfile));
});

test('matchScore rejects invalid inputs without crashing', async () => {
  const { matchScore, validateVectorPair } = await loadScore();

  assert.equal(matchScore([], []), null);
  assert.equal(matchScore([50, 60], [50]), null);
  assert.deepEqual(validateVectorPair([50, 60], [50, 101]), {
    valid: false,
    error: 'vetor[1] deve ficar entre 0 e 100.'
  });
});
