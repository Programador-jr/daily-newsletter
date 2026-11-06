/**
 * Fórmula heurística de compatibilidade política usada pelo questionário e pelos
 * comparadores do catálogo. O objetivo não é afirmar validade estatística, mas
 * sim produzir uma medida exploratória e reproduzível de proximidade entre dois
 * vetores em 12 eixos.
 *
 * A composição dá peso para quatro aspectos:
 * 1) similaridade por eixo (quão perto cada eixo está do valor alvo);
 * 2) direção do vetor (se as posições estão na mesma orientação em torno do centro);
 * 3) intensidade (se ambos os perfis têm magnitude semelhante);
 * 4) penalização por outlier (grandes divergências em um eixo isolado).
 */

const SCORE_CENTER = 50;

export function validateVectorPair(profile, vector, { label = "perfil" } = {}) {
  if (!Array.isArray(profile) || !Array.isArray(vector)) {
    return { valid: false, error: `${label} deve ser um array de números.` };
  }
  if (!profile.length) {
    return { valid: false, error: `${label} não pode estar vazio.` };
  }
  if (profile.length !== vector.length) {
    return {
      valid: false,
      error: `${label} e o vetor precisam ter o mesmo número de eixos.`
    };
  }

  for (let index = 0; index < profile.length; index += 1) {
    const value = profile[index];
    const target = vector[index];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return {
        valid: false,
        error: `${label}[${index}] deve ficar entre 0 e 100.`
      };
    }
    if (!Number.isFinite(target) || target < 0 || target > 100) {
      return {
        valid: false,
        error: `vetor[${index}] deve ficar entre 0 e 100.`
      };
    }
  }

  return { valid: true };
}

export function scoreBreakdown(profile, vector) {
  const validation = validateVectorPair(profile, vector, { label: "perfil" });
  if (!validation.valid) return null;

  const count = profile.length;
  let axisSimilarity = 0;
  let dot = 0;
  let userNorm = 0;
  let targetNorm = 0;
  let userIntensity = 0;
  let targetIntensity = 0;
  let maxDiff = 0;

  profile.forEach((value, index) => {
    const target = vector[index] ?? SCORE_CENTER;
    const diff = Math.abs(value - target);
    let similarity = Math.max(0, 1 - (diff / 50) ** 2);
    if ((value - SCORE_CENTER) * (target - SCORE_CENTER) < 0) {
      similarity *= 1
        - 0.45
          * Math.tanh(Math.abs(value - SCORE_CENTER) / 25)
          * Math.tanh(Math.abs(target - SCORE_CENTER) / 25);
    }
    axisSimilarity += similarity;

    const userCentered = value - SCORE_CENTER;
    const targetCentered = target - SCORE_CENTER;
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

  return {
    axisSimilarity: Number(((100 * axisSimilarity) / count).toFixed(2)),
    direction: Number(direction.toFixed(2)),
    magnitude: Number(magnitude.toFixed(2)),
    outlier: Number(outlier.toFixed(2)),
    score: Math.round(Math.max(0, Math.min(100, score)) * 10) / 10
  };
}

/**
 * Calcula uma proximidade exploratória em 0 a 100 entre dois perfis políticos.
 * O valor é interpretado como uma estimativa heurística e não como evidência
 * empírica de validade científica.
 */
export function matchScore(profile, vector) {
  const breakdown = scoreBreakdown(profile, vector);
  return breakdown ? breakdown.score : null;
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
