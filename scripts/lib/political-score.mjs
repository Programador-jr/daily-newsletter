/**
 * Espelha o cálculo de compatibilidade usado em public/js/political-compare.js
 * e public/js/ideology-quiz.js. A auditoria precisa da mesma fórmula para que
 * os relatórios correspondam ao que o site mostra.
 */
export function matchScore(profile, vector) {
  const count = profile.length;
  if (!count || vector.length !== count) return null;
  const center = 50;
  let axisSimilarity = 0;
  let dot = 0;
  let userNorm = 0;
  let targetNorm = 0;
  let userIntensity = 0;
  let targetIntensity = 0;
  let maxDiff = 0;

  profile.forEach((value, index) => {
    const target = vector[index] ?? center;
    const diff = Math.abs(value - target);
    let similarity = Math.max(0, 1 - (diff / 50) ** 2);
    if ((value - center) * (target - center) < 0) {
      similarity *= 1
        - 0.45
          * Math.tanh(Math.abs(value - center) / 25)
          * Math.tanh(Math.abs(target - center) / 25);
    }
    axisSimilarity += similarity;
    const userCentered = value - center;
    const targetCentered = target - center;
    dot += userCentered * targetCentered;
    userNorm += userCentered ** 2;
    targetNorm += targetCentered ** 2;
    userIntensity += Math.abs(userCentered);
    targetIntensity += Math.abs(targetCentered);
    maxDiff = Math.max(maxDiff, diff);
  });

  const augment = count * 8 ** 2;
  const direction = 50
    + 50 * ((dot + augment) / Math.sqrt((userNorm + augment) * (targetNorm + augment)));
  const magnitude = 100 - 2 * Math.abs((userIntensity - targetIntensity) / count);
  const outlier = 100 * Math.max(0, 1 - (maxDiff / 100) ** 2.5);
  const score = 0.42 * ((100 * axisSimilarity) / count)
    + 0.33 * direction
    + 0.18 * magnitude
    + 0.07 * outlier;
  return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10;
}

export function rankAgainst(profile, candidates, limit = candidates.length) {
  return candidates
    .map((candidate) => ({
      candidate,
      score: matchScore(profile, candidate.vetor)
    }))
    .filter((entry) => entry.score != null)
    .sort((first, second) =>
      second.score - first.score
      || String(first.candidate.nome).localeCompare(String(second.candidate.nome), "pt-BR"))
    .slice(0, limit);
}

export function findRank(profile, candidates, id) {
  const ranked = rankAgainst(profile, candidates);
  const index = ranked.findIndex((entry) => entry.candidate.id === id);
  return index === -1 ? null : { rank: index + 1, total: ranked.length, score: ranked[index].score };
}
