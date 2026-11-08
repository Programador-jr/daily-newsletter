/**
 * Auditoria de coerência do catálogo político.
 *
 * Verifica:
 * - se a camada de calibração foi realmente aplicada;
 * - se líderes ficam próximos do próprio partido;
 * - se partidos e personalidades ficam próximos da ideologia declarada;
 * - se livros têm vetor próprio, e não apenas uma cópia do autor;
 * - se países e regimes respeitam fatos estruturais elementares;
 * - vetores degenerados, duplicados e outliers.
 *
 * Uso:
 *   node scripts/audit-political-catalog.mjs
 *   node scripts/audit-political-catalog.mjs --json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { matchScore, rankAgainst, findRank } from "./lib/political-score.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = path.join(ROOT, "public", "data", "political-catalog.json");
const CALIBRATION_PATH = path.join(ROOT, "scripts", "political-vector-calibration.json");
const REPORT_PATH = path.join(ROOT, "public", "data", "political-catalog-audit.json");
const AXIS_ORDER = [
  "estrutura",
  "representacao",
  "poder",
  "imigracao",
  "diplomacia",
  "intervencao",
  "economia",
  "controle",
  "comercio",
  "religiao",
  "moral",
  "tecnologia"
];

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const calibration = fs.existsSync(CALIBRATION_PATH)
  ? JSON.parse(fs.readFileSync(CALIBRATION_PATH, "utf8"))
  : { profiles: {}, books: {} };

const errors = [];
const warnings = [];
const checks = {};

const fail = (area, message, detail = null) => {
  errors.push({ area, message, detail });
};
const warn = (area, message, detail = null) => {
  warnings.push({ area, message, detail });
};
const format = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);

const groups = {
  ideologias: catalog.profiles.ideologies,
  personalidades: catalog.profiles.figures,
  paises: catalog.profiles.countries,
  regimes: catalog.profiles.regimes,
  partidos: catalog.profiles.parties,
  valores: catalog.profiles.values
};

const byGroup = Object.fromEntries(
  Object.entries(groups).map(([group, entries]) => [group, new Map(entries.map((item) => [item.id, item]))])
);
const find = (group, id) => byGroup[group]?.get(id) || null;

function validateVector(vector, context) {
  if (!Array.isArray(vector) || vector.length !== 12) {
    fail("vetores", `${context}: vetor não tem 12 eixos`, vector);
    return;
  }
  vector.forEach((value, index) => {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      fail("vetores", `${context}: eixo ${AXIS_ORDER[index]} fora de 0–100`, value);
    }
  });
}

function checkAxes() {
  const ids = catalog.axes.map((axis) => axis.id);
  if (ids.join(",") !== AXIS_ORDER.join(",")) {
    fail("eixos", "Ordem dos eixos diferente da esperada", { actual: ids, expected: AXIS_ORDER });
    return;
  }
  checks.axes = { ok: true, order: ids };
}

function checkCalibrationApplied() {
  const results = [];
  const collections = calibration.profiles || {};
  for (const [group, entries] of Object.entries(collections)) {
    for (const [id, override] of Object.entries(entries)) {
      const item = find(group, id);
      if (!item) {
        fail("calibração", `${group}/${id}: item calibrado não existe no catálogo`);
        continue;
      }
      if (override.vetor) {
        const applied = item.vetor.every((value, index) => value === override.vetor[index]);
        results.push({ group, id, applied });
        if (!applied) {
          fail("calibração", `${group}/${id}: vetor calibrado não foi aplicado`, {
            catalogo: item.vetor,
            calibracao: override.vetor
          });
        }
        if (item.vectorCalibrated !== true) {
          fail("calibração", `${group}/${id}: vetor calibrado sem marca vectorCalibrated`);
        }
      }
      if (override.ideologia && item.ideologia !== override.ideologia) {
        fail("calibração", `${group}/${id}: ideologia calibrada não foi aplicada`, {
          catalogo: item.ideologia,
          calibracao: override.ideologia
        });
      }
      if (override.orientacao && item.orientacao !== override.orientacao) {
        fail("calibração", `${group}/${id}: orientação calibrada não foi aplicada`);
      }
      if (override.espectro && item.espectro !== override.espectro) {
        fail("calibração", `${group}/${id}: espectro calibrado não foi aplicado`);
      }
    }
  }

  const books = calibration.books || {};
  for (const [id, override] of Object.entries(books)) {
    const book = catalog.books.find((entry) => entry.id === id);
    if (!book) {
      fail("calibração", `livro/${id}: item calibrado não existe no catálogo`);
      continue;
    }
    if (override.vetor) {
      const applied = book.vetor.every((value, index) => value === override.vetor[index]);
      results.push({ group: "livros", id, applied });
      if (!applied) {
        fail("calibração", `livro/${id}: vetor calibrado não foi aplicado`);
      }
      if (book.vectorCalibrated !== true) {
        fail("calibração", `livro/${id}: vetor calibrado sem marca vectorCalibrated`);
      }
    }
    if (override.ideologias) {
      const applied = override.ideologias.every((ideologyId, index) => book.ideologias?.[index] === ideologyId)
        && book.ideologias?.length === override.ideologias.length;
      if (!applied) {
        fail("calibração", `livro/${id}: ideologias calibradas não foram aplicadas`);
      }
    }
  }

  checks.calibration = {
    declared: results.length,
    applied: results.filter((entry) => entry.applied).length,
    meta: calibration.meta || null
  };
}

function checkLeaderPartyPairs() {
  const pairs = [
    // Brasil
    { figure: "lula", party: "pt", mode: "current", maxRank: 3, minScore: 94 },
    { figure: "fernando-henrique-cardoso", party: "psdb", mode: "current", maxRank: 5, minScore: 92 },
    { figure: "bolsonaro", party: "pl", mode: "current", maxRank: 5, minScore: 92 },
    { figure: "getulio-vargas", party: "ptb-1945", mode: "historical", maxRank: 5, minScore: 90 },
    { figure: "joao-goulart", party: "ptb-1945", mode: "historical", maxRank: 5, minScore: 92 },
    // Argentina e América Latina
    { figure: "juan-peron", party: "partido-justicialista", mode: "current", maxRank: 5, minScore: 92 },
    // Estados Unidos
    { figure: "barack-obama", party: "partido-democrata-eua", mode: "current", maxRank: 8, minScore: 88 },
    { figure: "bill-clinton", party: "partido-democrata-eua", mode: "current", maxRank: 10, minScore: 86 },
    { figure: "joe-biden", party: "partido-democrata-eua", mode: "current", maxRank: 10, minScore: 86 },
    { figure: "donald-trump", party: "partido-republicano-eua", mode: "current", maxRank: 8, minScore: 88 },
    { figure: "ronald-reagan", party: "partido-republicano-eua", mode: "current", maxRank: 8, minScore: 88 },
    // Reino Unido
    { figure: "margaret-thatcher", party: "partido-conservador-reino-unido", mode: "current", maxRank: 5, minScore: 92 },
    { figure: "winston-churchill", party: "partido-conservador-reino-unido", mode: "current", maxRank: 12, minScore: 85 },
    { figure: "tony-blair", party: "partido-trabalhista-reino-unido", mode: "current", maxRank: 12, minScore: 85 },
    { figure: "keir-starmer", party: "partido-trabalhista-reino-unido", mode: "current", maxRank: 12, minScore: 85 },
    // Índia
    { figure: "jawaharlal-nehru", party: "congresso-nacional-indiano", mode: "current", maxRank: 8, minScore: 88 },
    { figure: "indira-gandhi", party: "congresso-nacional-indiano", mode: "current", maxRank: 8, minScore: 88 },
    { figure: "narendra-modi", party: "bjp", mode: "current", maxRank: 8, minScore: 88 },
    // África do Sul
    { figure: "nelson-mandela", party: "anc", mode: "current", maxRank: 5, minScore: 92 },
    { figure: "cyril-ramaphosa", party: "anc", mode: "current", maxRank: 8, minScore: 88 },
    // França, Itália
    { figure: "macron", party: "renaissance", mode: "current", maxRank: 10, minScore: 86 },
    { figure: "matteo-salvini", party: "lega", mode: "current", maxRank: 8, minScore: 88 },
    // Rússia, China, regimes
    { figure: "lenin", party: "partido-bolchevique", mode: "historical", maxRank: 5, minScore: 92 },
    { figure: "stalin", party: "partido-comunista-da-uniao-sovietica", mode: "historical", maxRank: 8, minScore: 88 },
    { figure: "mao", party: "partido-comunista-chines", mode: "current", maxRank: 8, minScore: 88 },
    { figure: "xi-jinping", party: "partido-comunista-chines", mode: "current", maxRank: 5, minScore: 92 },
    { figure: "hitler", party: "partido-nazista", mode: "historical", maxRank: 5, minScore: 92 },
    { figure: "mussolini", party: "partido-fascista-italiano", mode: "historical", maxRank: 5, minScore: 92 },
    { figure: "salazar", party: "uniao-nacional-portuguesa", mode: "historical", maxRank: 5, minScore: 90 },
    { figure: "francisco-franco", party: "falange", mode: "historical", maxRank: 10, minScore: 86 },
    { figure: "plinio-salgado", party: "aib", mode: "historical", maxRank: 5, minScore: 92 },
    // Hungria, Portugal, Espanha
    { figure: "viktor-orban", party: "fidesz", mode: "current", maxRank: 8, minScore: 88 }
  ];

  const results = [];
  for (const pair of pairs) {
    const figure = find("personalidades", pair.figure);
    const party = find("partidos", pair.party);
    if (!figure || !party) {
      fail("líder × partido", `${pair.figure} ou ${pair.party} não existe`);
      continue;
    }
    const pool = groups.partidos.filter((entry) =>
      pair.mode === "historical" ? entry.historico : !entry.historico
    );
    const rank = findRank(figure.vetor, pool, pair.party);
    const best = rankAgainst(figure.vetor, pool, 1)[0] || null;
    const result = {
      figure: figure.nome,
      figureId: figure.id,
      party: party.nome,
      partyId: party.id,
      mode: pair.mode,
      score: rank?.score ?? null,
      rank: rank?.rank ?? null,
      total: rank?.total ?? pool.length,
      best: best ? { name: best.candidate.nome, id: best.candidate.id, score: best.score } : null,
      maxRank: pair.maxRank,
      minScore: pair.minScore
    };
    results.push(result);
    if (!rank) {
      fail("líder × partido", `${figure.nome} não pôde ser comparado com ${party.nome}`);
      continue;
    }
    if (rank.rank > pair.maxRank || rank.score < pair.minScore) {
      fail(
        "líder × partido",
        `${figure.nome} → ${party.nome}: ${format(rank.score)}%, rank ${rank.rank}/${rank.total} `
          + `(mínimo ${pair.minScore}% e rank ${pair.maxRank}); melhor: ${best?.candidate.nome} ${format(best?.score)}%`,
        result
      );
    }
  }
  checks.leaderParty = results.sort((first, second) => first.rank - second.rank || second.score - first.score);
}

function checkIdeologyAffinity(group, minScore, maxRank) {
  const results = [];
  for (const item of groups[group]) {
    if (!item.ideologia) continue;
    const ideology = find("ideologias", item.ideologia);
    if (!ideology) {
      fail("ideologia", `${group}/${item.id}: ideologia ${item.ideologia} não existe`);
      continue;
    }
    const rank = findRank(item.vetor, groups.ideologias, ideology.id);
    const best = rankAgainst(item.vetor, groups.ideologias, 1)[0] || null;
    const result = {
      group,
      id: item.id,
      name: item.nome,
      ideology: ideology.nome,
      ideologyId: ideology.id,
      score: rank?.score ?? null,
      rank: rank?.rank ?? null,
      total: rank?.total ?? groups.ideologias.length,
      best: best ? { name: best.candidate.nome, id: best.candidate.id, score: best.score } : null
    };
    results.push(result);
    if (!rank || rank.score < minScore || rank.rank > maxRank) {
      const message = `${item.nome} → ${ideology.nome}: ${format(rank?.score)}%, `
        + `rank ${rank?.rank}/${rank?.total} (mínimo ${minScore}% e rank ${maxRank}); `
        + `melhor: ${best?.candidate.nome} ${format(best?.score)}%`;
      if (group === "partidos") fail("partido × ideologia", message, result);
      else warn("personalidade × ideologia", message, result);
    }
  }
  checks[group + "Ideology"] = results.sort((first, second) => first.score - second.score);
}

function checkBooks() {
  const results = [];
  const authors = new Map(groups.personalidades.map((item) => [item.id, item]));
  for (const book of catalog.books) {
    const author = book.autorId ? authors.get(book.autorId) : null;
    const diff = author
      ? book.vetor.map((value, index) => Math.abs(value - author.vetor[index]))
      : [];
    const maxDiff = diff.length ? Math.max(...diff) : null;
    const meanDiff = diff.length ? diff.reduce((sum, value) => sum + value, 0) / diff.length : null;
    const ideologyMatches = (book.ideologias || [])
      .map((id) => {
        const ideology = find("ideologias", id);
        if (!ideology) return null;
        return { id, name: ideology.nome, score: matchScore(book.vetor, ideology.vetor) };
      })
      .filter(Boolean)
      .sort((first, second) => second.score - first.score);
    const result = {
      id: book.id,
      title: book.titulo,
      author: book.autor,
      year: book.ano,
      maxDiff,
      meanDiff,
      vectorCalibrated: book.vectorCalibrated === true,
      ideologies: ideologyMatches,
      bestIdeology: ideologyMatches[0] || null
    };
    results.push(result);
    if (author && maxDiff === 0) {
      fail("livro × autor", `${book.titulo} copia exatamente o vetor de ${book.autor}`);
    } else if (author && maxDiff < 3) {
      warn("livro × autor", `${book.titulo} tem pouca diferenciação do autor (máx. ${format(maxDiff)})`);
    }
    if (book.ideologias?.length && (!result.bestIdeology || result.bestIdeology.score < 82)) {
      warn(
        "livro × ideologia",
        `${book.titulo}: melhor ideologia declarada é ${result.bestIdeology?.name || "—"} `
          + `${format(result.bestIdeology?.score ?? 0)}%`
      );
    }
  }
  checks.books = results.sort((first, second) => (first.maxDiff ?? 999) - (second.maxDiff ?? 999));
}

const COUNTRY_RUBRIC = {
  "estados-unidos": { estrutura: [80, 100], representacao: [72, 95], diplomacia: [60, 90], comercio: [40, 70] },
  "canada": { estrutura: [78, 100], representacao: [85, 100], diplomacia: [18, 50], imigracao: [70, 100] },
  "mexico": { estrutura: [55, 90], representacao: [50, 80], diplomacia: [5, 35] },
  "argentina": { estrutura: [55, 90], representacao: [55, 85], diplomacia: [5, 35] },
  "brasil": { estrutura: [65, 95], representacao: [60, 90], diplomacia: [5, 35], comercio: [45, 80] },
  "chile": { estrutura: [5, 35], representacao: [70, 95], diplomacia: [10, 40], comercio: [5, 35] },
  "uruguai": { estrutura: [5, 35], representacao: [85, 100], diplomacia: [2, 25] },
  "reino-unido": { estrutura: [20, 55], representacao: [78, 100], diplomacia: [35, 70] },
  "franca": { estrutura: [5, 35], representacao: [78, 100], diplomacia: [35, 70] },
  "alemanha": { estrutura: [70, 100], representacao: [85, 100], diplomacia: [20, 50] },
  "italia": { estrutura: [15, 45], representacao: [75, 100], diplomacia: [20, 55] },
  "espanha": { estrutura: [30, 60], representacao: [78, 100], diplomacia: [15, 45] },
  "portugal": { estrutura: [5, 35], representacao: [80, 100], diplomacia: [10, 40] },
  "suecia": { estrutura: [5, 35], representacao: [85, 100], diplomacia: [15, 45], imigracao: [65, 100] },
  "noruega": { estrutura: [5, 35], representacao: [85, 100], diplomacia: [15, 45], imigracao: [65, 100] },
  "dinamarca": { estrutura: [5, 35], representacao: [85, 100], diplomacia: [18, 50], imigracao: [50, 85] },
  "finlandia": { estrutura: [5, 35], representacao: [85, 100], diplomacia: [30, 65], imigracao: [60, 90] },
  "suica": { estrutura: [65, 95], representacao: [80, 100], diplomacia: [15, 45] },
  "polonia": { estrutura: [5, 35], representacao: [55, 85], diplomacia: [30, 65] },
  "hungria": { estrutura: [5, 35], representacao: [35, 70], diplomacia: [25, 60] },
  "russia": { estrutura: [30, 65], representacao: [5, 35], diplomacia: [55, 90] },
  "ucrania": { estrutura: [5, 35], representacao: [40, 75], diplomacia: [45, 85] },
  "grecia": { estrutura: [5, 35], representacao: [75, 100], diplomacia: [15, 50] },
  "turquia": { estrutura: [5, 35], representacao: [25, 60], diplomacia: [45, 80] },
  "china": { estrutura: [0, 20], representacao: [0, 20], diplomacia: [35, 70], comercio: [40, 75] },
  "japao": { estrutura: [5, 35], representacao: [78, 100], diplomacia: [10, 45] },
  "india": { estrutura: [65, 100], representacao: [65, 90], diplomacia: [25, 60], comercio: [45, 80] },
  "coreia-do-sul": { estrutura: [5, 35], representacao: [75, 100], diplomacia: [30, 60] },
  "coreia-do-norte": { estrutura: [0, 15], representacao: [0, 10], diplomacia: [60, 100] },
  "indonesia": { estrutura: [30, 70], representacao: [50, 80], diplomacia: [10, 40] },
  "paquistao": { estrutura: [45, 85], representacao: [30, 65], diplomacia: [45, 85] },
  "israel": { estrutura: [5, 35], representacao: [65, 95], diplomacia: [65, 95] },
  "ira": { estrutura: [5, 35], representacao: [0, 25], diplomacia: [45, 85] },
  "arabia-saudita": { estrutura: [0, 20], representacao: [0, 20], diplomacia: [45, 85] },
  "africa-do-sul": { estrutura: [35, 70], representacao: [65, 95], diplomacia: [10, 45] },
  "nigeria": { estrutura: [45, 85], representacao: [40, 70], diplomacia: [15, 50] },
  "egito": { estrutura: [5, 35], representacao: [10, 40], diplomacia: [30, 70] },
  "australia": { estrutura: [75, 100], representacao: [85, 100], diplomacia: [25, 60] },
  "nova-zelandia": { estrutura: [5, 40], representacao: [85, 100], diplomacia: [10, 40] },
  "costa-rica": { estrutura: [5, 40], representacao: [75, 100], diplomacia: [0, 15] }
};

function checkCountryRubric() {
  const results = [];
  for (const [id, ranges] of Object.entries(COUNTRY_RUBRIC)) {
    const country = find("paises", id);
    if (!country) {
      fail("países", `${id}: país da rubrica não existe`);
      continue;
    }
    const violations = [];
    for (const [axisId, [min, max]] of Object.entries(ranges)) {
      const index = AXIS_ORDER.indexOf(axisId);
      const value = country.vetor[index];
      if (value < min || value > max) {
        violations.push({ axis: axisId, value, min, max });
      }
    }
    const result = { id, name: country.nome, vector: country.vetor, violations };
    results.push(result);
    if (violations.length) {
      fail(
        "países",
        `${country.nome}: fora da rubrica em ${violations.map((entry) => `${entry.axis}=${entry.value} (${entry.min}–${entry.max})`).join(", ")}`,
        result
      );
    }
  }
  checks.countries = results;
}

function checkRegimeFacts() {
  const expectations = {
    "chile-pinochetista": { estrutura: [5, 35], representacao: [0, 25] },
    "africa-do-sul-apartheid": { estrutura: [20, 55], representacao: [0, 25] },
    "brasil-ditadura-militar": { estrutura: [65, 95], representacao: [0, 25] },
    "uniao-sovietica": { estrutura: [0, 25], representacao: [0, 15] },
    "alemanha-nazista": { estrutura: [5, 35], representacao: [0, 10] },
    "italia-fascista": { estrutura: [10, 40], representacao: [0, 15] },
    "portugal-salazarista": { estrutura: [5, 35], representacao: [0, 20] },
    "espanha-franquista": { estrutura: [10, 45], representacao: [0, 20] }
  };
  const results = [];
  for (const [id, ranges] of Object.entries(expectations)) {
    const regime = find("regimes", id);
    if (!regime) {
      fail("regimes", `${id}: regime não existe`);
      continue;
    }
    const violations = [];
    for (const [axisId, [min, max]] of Object.entries(ranges)) {
      const value = regime.vetor[AXIS_ORDER.indexOf(axisId)];
      if (value < min || value > max) violations.push({ axis: axisId, value, min, max });
    }
    results.push({ id, name: regime.nome, violations });
    if (violations.length) {
      fail(
        "regimes",
        `${regime.nome}: fora da rubrica em ${violations.map((entry) => `${entry.axis}=${entry.value} (${entry.min}–${entry.max})`).join(", ")}`
      );
    }
  }
  checks.regimes = results;
}

function checkVectorSanity() {
  const results = [];
  for (const [group, entries] of Object.entries(groups)) {
    for (const item of entries) {
      validateVector(item.vetor, `${group}/${item.id}`);
      const neutral = item.vetor.filter((value) => value === 50).length;
      const extreme = item.vetor.filter((value) => value <= 5 || value >= 95).length;
      // "Valores" são conceitos de eixo único: os demais eixos ficam
      // deliberadamente no centro para não interferir na comparação.
      if (group !== "valores" && neutral >= 8) {
        warn("vetores", `${group}/${item.id}: ${neutral} eixos exatamente no centro`);
      }
      if (group !== "valores" && extreme >= 9) {
        warn("vetores", `${group}/${item.id}: ${extreme} eixos em extremos (≤5 ou ≥95)`);
      }
      results.push({ group, id: item.id, neutral, extreme });
    }
  }

  const duplicates = [];
  for (const [group, entries] of Object.entries(groups)) {
    if (group === "valores") continue;
    const seen = new Map();
    for (const item of entries) {
      const key = item.vetor.join(",");
      if (seen.has(key)) {
        const other = seen.get(key);
        duplicates.push({ group, first: other.id, second: item.id });
        warn("vetores", `${group}/${other.id} e ${item.id} têm vetor idêntico`);
      } else {
        seen.set(key, item);
      }
    }
  }
  checks.sanity = { items: results.length, duplicates };
}

function checkCoverage() {
  const calibrated = {};
  for (const group of Object.keys(groups)) {
    const declared = calibration.profiles?.[group] || {};
    const inCatalog = Object.keys(declared).filter((id) => find(group, id));
    calibrated[group] = {
      declared: inCatalog.length,
      total: groups[group].length,
      share: groups[group].length ? Math.round((inCatalog.length / groups[group].length) * 1000) / 10 : 0
    };
  }
  const calibratedBooks = Object.keys(calibration.books || {})
    .filter((id) => catalog.books.some((book) => book.id === id));
  calibrated.livros = {
    declared: calibratedBooks.length,
    total: catalog.books.length,
    share: catalog.books.length ? Math.round((calibratedBooks.length / catalog.books.length) * 1000) / 10 : 0
  };
  checks.coverage = calibrated;
}

function main() {
  checkAxes();
  checkCalibrationApplied();
  checkVectorSanity();
  checkLeaderPartyPairs();
  checkIdeologyAffinity("partidos", 85, 10);
  checkIdeologyAffinity("personalidades", 80, 20);
  checkBooks();
  checkCountryRubric();
  checkRegimeFacts();
  checkCoverage();

  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      catalogGeneratedAt: catalog.meta?.generatedAt || null,
      calibrationVersion: calibration.meta?.version || null,
      scoreFormula: "matchScore de /comparar e do quiz",
      thresholds: {
        leaderParty: "definido por par",
        partyIdeology: "≥85% e rank ≤10",
        figureIdeology: "≥80% e rank ≤20 (aviso)",
        books: "vetor diferente do autor",
        countries: "rubrica estrutural"
      }
    },
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      ok: errors.length === 0
    },
    errors,
    warnings,
    checks
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Auditoria do catálogo político`);
    console.log(`Erros: ${errors.length} | Avisos: ${warnings.length}`);
    for (const error of errors) console.log(`ERRO [${error.area}] ${error.message}`);
    for (const warning of warnings.slice(0, 40)) console.log(`AVISO [${warning.area}] ${warning.message}`);
    if (warnings.length > 40) console.log(`... +${warnings.length - 40} avisos`);
    console.log(`Relatório: ${path.relative(ROOT, REPORT_PATH)}`);
  }

  if (errors.length) process.exitCode = 1;
}

main();
