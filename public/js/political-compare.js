/**
 * Comparador político — perfis do catálogo em 12 eixos.
 *
 * A página funciona sem depender do resultado do quiz. A seleção pode vir
 * da URL (?perfis=ideologias:social-democracia,paises:brasil) ou da busca.
 * Também aceita links no formato do 12 Axes (?items=personality:renan-santos,
 * personality:lula-da-silva), normalizando-os para o formato interno.
 * Cada perfil é comparado apenas nos eixos em que tem posição definida,
 * o que preserva os conceitos com vetor parcial.
 */
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("compare-main");
  if (!main) return;

  const MAX_PROFILES = 3;
  const SERIES = ["a", "b", "c"];
  const GROUP_ALIASES = {
    personality: "personalidades",
    personalities: "personalidades",
    personalidade: "personalidades",
    personalidades: "personalidades",
    ideology: "ideologias",
    ideologies: "ideologias",
    ideologia: "ideologias",
    ideologias: "ideologias",
    country: "paises",
    countries: "paises",
    pais: "paises",
    paises: "paises",
    regime: "regimes",
    regimes: "regimes",
    party: "partidos",
    parties: "partidos",
    partido: "partidos",
    partidos: "partidos",
    value: "valores",
    values: "valores",
    valor: "valores",
    valores: "valores"
  };
  const GROUP_CANDIDATES = {
    personalidades: ["personalidades"],
    ideologias: ["ideologias"],
    paises: ["paises", "regimes"],
    regimes: ["regimes", "paises"],
    partidos: ["partidos"],
    valores: ["valores"]
  };
  const REGION_COLORS = {
    "América do Sul": "#3f7c5a",
    "América do Norte": "#35608f",
    Europa: "#5b4b84",
    Eurásia: "#7a4090",
    Ásia: "#a84f26",
    "Oriente Médio": "#a07a24",
    África: "#8f5a2e",
    Oceania: "#2f7ca3"
  };
  const VALUE_GROUP_COLORS = {
    politicos: "#35608f",
    externa: "#3f7c5a",
    economicos: "#8a6522",
    imigracao: "#6852a0",
    sociedade: "#a33a57",
    tecnologicos: "#2f7ca3"
  };
  const VALUE_GROUP_ICONS = {
    politicos: "fa-landmark",
    externa: "fa-globe",
    economicos: "fa-coins",
    imigracao: "fa-people-group",
    sociedade: "fa-heart",
    tecnologicos: "fa-microchip"
  };
  const CURRENT_COUNTRY_EXCLUDE =
    /^(Região|Distrito|Território|Autonomia|Nação|Província|Cidade|Departamento|Cantão|Comunidade|União supranacional)/i;
  const COMPASS_REGION_META = {
    "esq-radical": { base: "#830214", saturation: 85, lightness: 74 },
    terceira: { base: "#4B2A63", saturation: 65, lightness: 78 },
    "ext-direita": { base: "#001743", saturation: 85, lightness: 66 },
    esquerda: { base: "#035732", saturation: 65, lightness: 72 },
    centro: { base: "#4B5058", saturation: 10, lightness: 80 },
    direita: { base: "#2D4778", saturation: 90, lightness: 77 },
    anarquismo: { base: "#2B2B2B", saturation: 0, lightness: 72 },
    libertario: { base: "#946201", saturation: 90, lightness: 68, hue: 47 }
  };
  const COMPASS_SPECTRUM_LABELS = {
    "esq-radical": "Esquerda radical",
    esquerda: "Esquerda",
    centro: "Centro",
    direita: "Direita",
    "ext-direita": "Extrema-direita",
    terceira: "Terceira posição",
    libertario: "Libertário",
    anarquismo: "Anarquista"
  };
  const COMPASS_REGION_RECTS = [
    { key: "esq-radical", x: [0, 3], y: [0, 3] },
    { key: "terceira", x: [3, 6], y: [0, 3] },
    { key: "ext-direita", x: [6, 9], y: [0, 3] },
    { key: "esquerda", x: [0, 3], y: [3, 7] },
    { key: "centro", x: [3, 6], y: [3, 7] },
    { key: "direita", x: [6, 9], y: [3, 7] },
    { key: "anarquismo", x: [0, 4.5], y: [7, 9] },
    { key: "libertario", x: [4.5, 9], y: [7, 9] }
  ];

  const state = {
    entries: [],
    byKey: new Map(),
    selected: [],
    query: "",
    activeIndex: -1,
    countryMode: "current",
    partyMode: "current"
  };

  let data;
  let groups = [];
  let familiesById = new Map();
  let areasById = new Map();
  let valueGroupsById = new Map();
  let ideologyNameById = new Map();
  let placeNameById = new Map();
  let placeById = new Map();
  let optionButtons = [];
  let elements;

  const normalize = (value) =>
    String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const el = (tag, attrs, ...children) => {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) continue;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "style") {
          for (const [property, propertyValue] of Object.entries(value)) {
            node.style.setProperty(property, propertyValue);
          }
        } else if (value === true) node.setAttribute(key, "");
        else node.setAttribute(key, value);
      }
    }
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  };

  const icon = (name) => el("i", { class: `fas ${name}`, "aria-hidden": "true" });

  const initials = (name) => {
    const words = String(name || "")
      .replace(/[^\p{L}\s-]/gu, " ")
      .split(/[\s-]+/)
      .filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const isUnverifiedImage = (item) =>
    Boolean(item.imageLicenseUnverified) ||
    /não verificada|deve ser conferida/i.test(`${item.imageNote || ""} ${item.logoNote || ""}`);

  const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;
  const formatMatchPercent = (value) =>
    `${Number(Number(value).toFixed(1)).toLocaleString("pt-BR")}%`;
  const formatPoints = (value) =>
    `${Number(value.toFixed(1)).toLocaleString("pt-BR")} ${Math.abs(value) === 1 ? "ponto" : "pontos"}`;

  const clamp = (min, max, value) => Math.max(min, Math.min(max, Number(value) || 0));

  const axisIndexById = (id) => data.axes.findIndex((axis) => axis.id === id);

  const vectorOf = (item) => {
    if (Array.isArray(item.vetor) && item.vetor.length === data.axes.length) return item.vetor;
    if (Array.isArray(item.axes) && item.axes.length === data.axes.length) return item.axes;
    return null;
  };

  const knownAxesOf = (item) =>
    Array.isArray(item.knownAxes) ? new Set(item.knownAxes) : null;

  const valueFor = (item, axis, index) => {
    const vector = vectorOf(item);
    if (!vector) return null;
    const known = knownAxesOf(item);
    if (known && !known.has(axis.id)) return null;
    const value = Number(vector[index]);
    if (!Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, value));
  };

  const nameOf = (item) => item.nome || item.name || item.titulo || "Perfil";

  const matchScoreOn = (profile, vector) => {
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
        similarity *= 1 - 0.45 * Math.tanh(Math.abs(value - center) / 25) * Math.tanh(Math.abs(target - center) / 25);
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
    const direction = 50 + 50 * ((dot + augment) / Math.sqrt((userNorm + augment) * (targetNorm + augment)));
    const magnitude = 100 - 2 * Math.abs((userIntensity - targetIntensity) / count);
    const outlier = 100 * Math.max(0, 1 - (maxDiff / 100) ** 2.5);
    const score = 0.42 * (100 * axisSimilarity / count) + 0.33 * direction + 0.18 * magnitude + 0.07 * outlier;
    return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10;
  };

  const sharedScores = (target, candidate) => {
    if (!target || !candidate || target.key === candidate.key) return null;
    const targetValues = [];
    const candidateValues = [];
    data.axes.forEach((axis, index) => {
      const first = valueFor(target.item, axis, index);
      const second = valueFor(candidate.item, axis, index);
      if (first == null || second == null) return;
      targetValues.push(first);
      candidateValues.push(second);
    });
    if (!targetValues.length) return null;
    return {
      score: matchScoreOn(targetValues, candidateValues),
      shared: targetValues.length
    };
  };

  const scoreAgainstVector = (values, indexes, candidate) => {
    if (!candidate) return null;
    const profile = [];
    const vector = [];
    indexes.forEach((index) => {
      const candidateValue = valueFor(candidate.item, data.axes[index], index);
      if (candidateValue == null) return;
      profile.push(values[index]);
      vector.push(candidateValue);
    });
    if (!profile.length) return null;
    return {
      score: matchScoreOn(profile, vector),
      shared: profile.length
    };
  };

  const rankEntries = (target, candidates, limit = 3) => {
    const scored = [];
    candidates.forEach((candidate) => {
      const stats = sharedScores(target, candidate);
      if (!stats) return;
      scored.push({ entry: candidate, ...stats });
    });
    return scored
      .sort((first, second) =>
        second.score - first.score ||
        second.shared - first.shared ||
        first.entry.name.localeCompare(second.entry.name, "pt-BR"))
      .slice(0, limit);
  };

  const rankAgainstVector = (values, indexes, candidates, limit = 3) => {
    const scored = [];
    candidates.forEach((candidate) => {
      const stats = scoreAgainstVector(values, indexes, candidate);
      if (!stats) return;
      scored.push({ entry: candidate, ...stats });
    });
    return scored
      .sort((first, second) =>
        second.score - first.score ||
        second.shared - first.shared ||
        first.entry.name.localeCompare(second.entry.name, "pt-BR"))
      .slice(0, limit);
  };

  const commonVector = () => {
    const values = data.axes.map((axis, index) => {
      const points = state.selected
        .map((entry) => valueFor(entry.item, axis, index))
        .filter((value) => value != null);
      if (!points.length) return null;
      return points.reduce((sum, value) => sum + value, 0) / points.length;
    });
    const indexes = values
      .map((value, index) => (value == null ? -1 : index))
      .filter((index) => index >= 0);
    return { values, indexes };
  };

  const valueScore = (valueEntry, profileEntry) => {
    const item = valueEntry.item;
    const indexes = (item.knownAxes || [])
      .map((axisId) => axisIndexById(axisId))
      .filter((index) => index >= 0);
    if (!indexes.length) return null;
    const points = [];
    indexes.forEach((index) => {
      const target = valueFor(profileEntry.item, data.axes[index], index);
      const source = valueFor(item, data.axes[index], index);
      if (target == null || source == null) return;
      points.push({ target, source });
    });
    if (!points.length) return null;
    const similarity = points.reduce((sum, point) => {
      const diff = Math.abs(point.target - point.source);
      return sum + Math.max(0, 1 - (diff / 50) ** 2);
    }, 0);
    return {
      score: Math.round((100 * similarity / points.length) * 10) / 10,
      shared: points.length
    };
  };

  const rankValues = (profileEntry, groupId) => {
    const candidates = state.entries.filter((entry) =>
      entry.group === "valores" &&
      entry.item.groupId === groupId &&
      entry.key !== profileEntry.key
    );
    const scored = [];
    candidates.forEach((candidate) => {
      const stats = valueScore(candidate, profileEntry);
      if (!stats) return;
      scored.push({ entry: candidate, ...stats });
    });
    return scored.sort((first, second) =>
      second.score - first.score ||
      first.entry.name.localeCompare(second.entry.name, "pt-BR"));
  };

  const isCurrentCountry = (entry) =>
    entry.group === "paises" &&
    !entry.item.historico &&
    !CURRENT_COUNTRY_EXCLUDE.test(entry.item.categoria || "") &&
    !/[()]/.test(entry.name);

  const countryPool = () => state.entries.filter((entry) => {
    if (state.countryMode === "historical") {
      return entry.group === "regimes" || (entry.group === "paises" && entry.item.historico);
    }
    return isCurrentCountry(entry);
  });

  const partyPool = () => state.entries.filter((entry) =>
    entry.group === "partidos" &&
    (state.partyMode === "historical" ? entry.item.historico : !entry.item.historico)
  );

  const groupPool = (group) => state.entries.filter((entry) => entry.group === group);

  const compassHexToRgb = (value) => {
    const match = /^#([0-9a-f]{6})$/i.exec(value || "");
    if (!match) return [16, 16, 16];
    const number = parseInt(match[1], 16);
    return [16, 8, 0].map((shift) => (number >> shift) & 255);
  };

  const compassRgb = (channels) => `rgb(${channels.map((value) => Math.round(value)).join(",")})`;

  const compassMix = (first, second, amount) =>
    first.map((value, index) => value + (second[index] - value) * amount);

  const compassMixMany = (first, second, third, amount) => amount < 0.5
    ? compassMix(first, second, amount * 2)
    : compassMix(second, third, (amount - 0.5) * 2);

  const compassHue = ([red, green, blue]) => {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    if (max === min) return 0;
    const delta = max - min;
    const result = max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
    return ((result * 60) + 360) % 360;
  };

  const compassHslToRgb = (hue, saturation, lightness) => {
    const chroma = (saturation / 100) * Math.min(lightness / 100, 1 - lightness / 100);
    const channel = (offset) => {
      const position = (offset + hue / 30) % 12;
      return (lightness / 100 - chroma * Math.max(-1, Math.min(position - 3, Math.min(9 - position, 1)))) * 255;
    };
    return [channel(0), channel(8), channel(4)];
  };

  const compassRegionColor = (key) => {
    const meta = COMPASS_REGION_META[key] || COMPASS_REGION_META.centro;
    const hue = meta.hue ?? compassHue(compassHexToRgb(meta.base));
    return compassHslToRgb(hue, meta.saturation, meta.lightness);
  };

  const compassGridColor = (x, y) => {
    const [centerX, centerY] = [x + 0.5, y + 0.5];
    const total = [0, 0, 0];
    let weight = 0;
    COMPASS_REGION_RECTS.forEach((region) => {
      const distanceX = Math.max(region.x[0] - centerX, 0, centerX - region.x[1]);
      const distanceY = Math.max(region.y[0] - centerY, 0, centerY - region.y[1]);
      const influence = Math.exp(-(distanceX ** 2 + distanceY ** 2) / (2 * 0.45 ** 2));
      if (influence < 0.03) return;
      weight += influence;
      compassRegionColor(region.key).forEach((channel, index) => {
        total[index] += channel * influence;
      });
    });
    return compassRgb(total.map((channel) => channel / weight));
  };

  const COMPASS_GRID_COLORS = Array.from({ length: 81 }, (_, index) =>
    compassGridColor(index % 9, Math.floor(index / 9)));
  const COMPASS_STRIP_COLORS = Array.from({ length: 9 }, (_, index) => {
    const pink = compassMix(compassHexToRgb("#D23E84"), [255, 255, 255], 0.72);
    const gray = compassMix([123, 127, 134], [255, 255, 255], 0.72);
    const brown = compassMix(compassHexToRgb("#74502C"), [255, 255, 255], 0.72);
    return compassRgb(compassMixMany(pink, gray, brown, index / 8));
  });

  const compassCell = (value) => Math.max(0, Math.min(8, Math.floor((value / 100) * 9)));

  const compassRegionFor = (right, authoritarian) => {
    const x = compassCell(right);
    const y = compassCell(100 - authoritarian);
    if (y <= 2) return x <= 2 ? "esq-radical" : x <= 5 ? "terceira" : "ext-direita";
    if (y <= 6) return x <= 2 ? "esquerda" : x <= 5 ? "centro" : "direita";
    return x <= 3 ? "anarquismo" : x >= 5 ? "libertario" : right < 50 ? "anarquismo" : "libertario";
  };

  const compassSocialColor = (traditional) => compassRgb(compassMixMany(
    compassHexToRgb("#D23E84"),
    [123, 127, 134],
    compassHexToRgb("#74502C"),
    traditional / 100
  ));

  const computeCompass = (entry) => {
    const axisValue = (id) => {
      const index = axisIndexById(id);
      if (index < 0) return 50;
      return valueFor(entry.item, data.axes[index], index) ?? 50;
    };
    const economy = axisValue("economia");
    const control = axisValue("controle");
    const power = axisValue("poder");
    const representation = axisValue("representacao");
    const structure = axisValue("estrutura");
    const moral = axisValue("moral");
    const right = clamp(0, 100, 100 - (0.6 * economy + 0.4 * control));
    const authoritarian = clamp(0, 100, (power + (100 - representation) + (100 - structure)) / 3);
    const traditional = clamp(0, 100, 100 - moral);
    const regionKey = compassRegionFor(right, authoritarian);
    return {
      right,
      authoritarian,
      traditional,
      regionKey,
      region: COMPASS_REGION_META[regionKey],
      socialColor: compassSocialColor(traditional)
    };
  };

  const catalogUrlFor = (entry) => {
    const id = encodeURIComponent(entry.item.id);
    if (entry.group === "ideologias") return `/catalogo-politico#${id}`;
    if (entry.group === "valores") return `/catalogo-politico?catalogo=valores#valor-${id}`;
    if (entry.group === "personalidades") return `/catalogo-politico?catalogo=personalidades#${id}`;
    if (entry.group === "paises") return `/catalogo-politico?catalogo=paises#${id}`;
    if (entry.group === "regimes") return `/catalogo-politico?catalogo=paises#${id}`;
    return `/catalogo-politico?catalogo=partidos#${id}`;
  };

  const buildGroups = () => [
    {
      key: "ideologias",
      label: "Ideologias",
      type: "Ideologia",
      catalogKey: "ideologias",
      items: data.profiles.ideologies || [],
      meta: (item) => [familiesById.get(item.familia)?.rotulo, item.periodo].filter(Boolean).join(", "),
      color: (item) => familiesById.get(item.familia)?.cor || "#0b766b",
      search: (item) => [
        item.ideia,
        familiesById.get(item.familia)?.rotulo,
        item.periodo,
        item.categoria
      ]
    },
    {
      key: "valores",
      label: "Valores",
      type: "Valor",
      catalogKey: "valores",
      items: data.profiles.values || [],
      meta: (item) => {
        const group = valueGroupsById.get(item.groupId)?.label || item.group;
        const known = (item.knownAxes || []).length;
        return [group, `${known} de 12 eixos definidos`].filter(Boolean).join(", ");
      },
      color: (item) => VALUE_GROUP_COLORS[item.groupId] || "#0b766b",
      search: (item) => [
        item.group,
        valueGroupsById.get(item.groupId)?.label,
        item.ideia
      ]
    },
    {
      key: "personalidades",
      label: "Personalidades",
      type: "Personalidade",
      catalogKey: "personalidades",
      items: data.profiles.figures || [],
      meta: (item) => [item.papel || item.role || item.areaLabel, item.periodo].filter(Boolean).join(", "),
      color: (item) => areasById.get(item.area)?.cor || "#0b766b",
      search: (item) => [
        item.papel,
        item.role,
        item.areaLabel,
        item.pais,
        item.periodo,
        ideologyNameById.get(item.ideologia)
      ]
    },
    {
      key: "paises",
      label: "Países",
      type: "País",
      catalogKey: "paises",
      items: data.profiles.countries || [],
      meta: (item) => [item.regiao, item.categoria || item.periodo].filter(Boolean).join(", "),
      color: (item) => REGION_COLORS[item.regiao] || "#35608f",
      search: (item) => [
        item.regiao,
        item.categoria,
        item.periodo,
        ideologiaNames(item.ideologias)
      ]
    },
    {
      key: "regimes",
      label: "Regimes",
      type: "Regime",
      catalogKey: "paises",
      items: data.profiles.regimes || [],
      meta: (item) => [item.periodo, item.regiao].filter(Boolean).join(", "),
      color: (item) => REGION_COLORS[item.regiao] || "#8a4b3a",
      search: (item) => [
        item.regiao,
        item.categoria,
        item.periodo,
        ideologiaNames(item.ideologias)
      ]
    },
    {
      key: "partidos",
      label: "Partidos",
      type: "Partido",
      catalogKey: "partidos",
      items: data.profiles.parties || [],
      meta: (item) => [item.sigla, placeNameById.get(item.paisId), item.orientacao].filter(Boolean).join(", "),
      color: (item) => {
        const family = familiesById.get(item.espectro);
        if (family?.cor) return family.cor;
        const ideology = data.profiles.ideologies.find((entry) => entry.id === item.ideologia);
        return familiesById.get(ideology?.familia)?.cor || "#8f5a2e";
      },
      search: (item) => [
        item.sigla,
        item.orientacao,
        item.periodo,
        placeNameById.get(item.paisId),
        ideologyNameById.get(item.ideologia),
        (item.marcos || []).join(" ")
      ]
    }
  ];

  const ideologiaNames = (ids) =>
    (ids || []).map((id) => ideologyNameById.get(id)).filter(Boolean).join(" ");

  const buildEntries = () => {
    state.entries = [];
    state.byKey.clear();
    groups.forEach((group) => {
      group.items.forEach((item) => {
        if (!vectorOf(item)) return;
        const entry = {
          key: `${group.key}:${item.id}`,
          group: group.key,
          groupLabel: group.label,
          type: group.type,
          catalogKey: group.catalogKey,
          item,
          name: nameOf(item),
          meta: group.meta(item),
          color: group.color(item),
          search: normalize([
            nameOf(item),
            item.sigla,
            item.resumo,
            item.summary,
            item.description,
            item.detail,
            item.periodo,
            item.group,
            group.label,
            group.type,
            group.meta(item),
            ...group.search(item)
          ].filter(Boolean).join(" "))
        };
        state.entries.push(entry);
        state.byKey.set(entry.key, entry);
      });
    });
  };

  const isSelected = (key) => state.selected.some((entry) => entry.key === key);

  const pairStats = (first, second) => {
    const stats = sharedScores(first, second);
    if (!stats) return null;
    return { score: stats.score, shared: stats.shared };
  };

  const nearestEntries = () => {
    const selected = state.selected;
    if (!selected.length) return featuredEntries();
    const scored = [];
    state.entries.forEach((entry) => {
      if (isSelected(entry.key)) return;
      const scores = selected
        .map((chosen) => pairStats(chosen, entry))
        .filter(Boolean)
        .map((stats) => stats.score);
      if (!scores.length) return;
      scored.push({
        entry,
        score: scores.reduce((sum, score) => sum + score, 0) / scores.length
      });
    });
    return scored
      .sort((first, second) =>
        second.score - first.score ||
        first.entry.name.localeCompare(second.entry.name, "pt-BR"))
      .slice(0, 9)
      .map(({ entry }) => entry);
  };

  const featuredEntries = () => {
    const keys = [];
    const add = (group, id) => {
      const key = `${group}:${id}`;
      if (state.byKey.has(key) && !keys.includes(key)) keys.push(key);
    };
    (data.featured?.ideologias || []).slice(0, 2).forEach((id) => add("ideologias", id));
    (data.featured?.valores || []).slice(0, 1).forEach((id) => add("valores", id));
    (data.featured?.personalidades || []).slice(0, 2).forEach((id) => add("personalidades", id));
    (data.featured?.paises || []).forEach((id) => {
      if (state.byKey.has(`paises:${id}`)) add("paises", id);
      else add("regimes", id);
    });
    (data.featured?.partidos || []).slice(0, 2).forEach((id) => add("partidos", id));
    return keys.map((key) => state.byKey.get(key)).filter(Boolean);
  };

  const findMatches = (query) => {
    const available = state.entries.filter((entry) => !isSelected(entry.key));
    const normalized = normalize(query);
    if (!normalized) return nearestEntries().filter((entry) => !isSelected(entry.key)).slice(0, 9);
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return available
      .map((entry) => {
        const name = normalize(entry.name);
        const haystack = `${name} ${entry.search}`;
        if (!tokens.every((token) => haystack.includes(token))) return null;
        let rank = 4;
        if (name === normalized) rank = 0;
        else if (name.startsWith(normalized)) rank = 1;
        else if (name.includes(normalized)) rank = 2;
        else if (tokens.every((token) => name.includes(token))) rank = 3;
        return { entry, rank, length: name.length };
      })
      .filter(Boolean)
      .sort((first, second) =>
        first.rank - second.rank ||
        first.length - second.length ||
        first.entry.name.localeCompare(second.entry.name, "pt-BR"))
      .slice(0, 9)
      .map(({ entry }) => entry);
  };

  const imageInfoFor = (entry) => {
    const item = entry.item;
    let path = "";
    let alt = "";
    let variant = "";
    if (entry.group === "personalidades") {
      if (!isUnverifiedImage(item)) path = item.imagePath || "";
      alt = `Retrato de ${entry.name}`;
    } else if (entry.group === "paises" || entry.group === "regimes") {
      path = item.imagePath || "";
      alt = `Bandeira ou símbolo de ${entry.name}`;
      variant = "is-flag";
    } else if (entry.group === "partidos") {
      path = item.logoPath || item.imagePath || "";
      alt = `Símbolo de ${entry.name}`;
      variant = "is-logo";
    }
    return { path, alt, variant };
  };

  const avatarFor = (entry, small = false) => {
    const holder = el("span", { class: `compare-avatar${small ? " is-small" : ""}` });
    holder.style.setProperty("--avatar-color", entry.color);
    const item = entry.item;
    const fallback = el("span", { class: "compare-avatar-fallback", "aria-hidden": "true" });
    fallback.textContent =
      entry.group === "paises" || entry.group === "regimes" || entry.group === "partidos"
        ? item.sigla || initials(entry.name)
        : initials(entry.name);

    const { path, alt, variant } = imageInfoFor(entry);
    if (path) {
      if (variant) holder.classList.add(variant);
      const image = el("img", {
        src: path,
        alt,
        loading: "lazy",
        decoding: "async"
      });
      if (item.imageNote) image.title = item.imageNote;
      image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
      holder.append(image);
    } else {
      holder.append(fallback);
    }
    return holder;
  };

  const profileCard = (entry, index) => {
    const card = el("article", { class: "compare-profile", "data-key": entry.key });
    card.style.setProperty("--compare-color", `var(--compare-${SERIES[index]})`);
    const remove = el("button", {
      class: "compare-profile-remove",
      type: "button",
      "aria-label": `Remover ${entry.name} da comparação`,
      title: "Remover"
    }, el("span", { "aria-hidden": "true", text: "×" }));
    remove.addEventListener("click", () => removeEntry(entry.key));

    const main = el(
      "div",
      { class: "compare-profile-main" },
      avatarFor(entry),
      el(
        "div",
        { class: "compare-profile-text" },
        el("span", { class: "compare-type", text: entry.type }),
        el("h3", { class: "compare-name", text: entry.name }),
        entry.meta ? el("span", { class: "compare-meta", text: entry.meta }) : null
      )
    );

    const foot = el(
      "div",
      { class: "compare-profile-foot" },
      el(
        "span",
        { class: "compare-profile-slot" },
        el("i", {
          class: `compare-dot is-series-${index}`,
          style: { "--dot": `var(--compare-${SERIES[index]})` }
        }),
        `Perfil ${index + 1}`
      ),
      el("a", { class: "compare-profile-link", href: catalogUrlFor(entry), text: "Ficha no catálogo" })
    );

    card.append(remove, main, foot);
    return card;
  };

  const renderSelected = () => {
    elements.selected.replaceChildren(...state.selected.map((entry, index) => profileCard(entry, index)));
  };

  const renderStats = () => {
    elements.stats.replaceChildren(
      el("span", {}, el("strong", { text: String(state.entries.length) }), " perfis"),
      el("span", {}, el("strong", { text: String(groups.length) }), " coleções"),
      el("span", {}, el("strong", { text: String(data.axes.length) }), " eixos")
    );
  };

  const renderLegend = () => {
    elements.legend.replaceChildren();
    state.selected.forEach((entry, index) => {
      elements.legend.append(
        el(
          "span",
          { class: `is-series-${index}` },
          el("i", { style: { "--dot": `var(--compare-${SERIES[index]})` }, "aria-hidden": "true" }),
          entry.name
        )
      );
    });
  };

  const renderPairs = () => {
    elements.pairs.replaceChildren();
    const pairs = [];
    for (let first = 0; first < state.selected.length; first += 1) {
      for (let second = first + 1; second < state.selected.length; second += 1) {
        pairs.push({
          first,
          second,
          stats: pairStats(state.selected[first], state.selected[second])
        });
      }
    }
    pairs.forEach(({ first, second, stats }) => {
      const card = el("article", { class: "compare-pair" });
      card.style.setProperty("--pair-a", `var(--compare-${SERIES[first]})`);
      card.style.setProperty("--pair-b", `var(--compare-${SERIES[second]})`);
      const pairSide = (entry, index) => el(
        "span",
        { class: "compare-pair-side" },
        el("i", {
          class: `is-series-${index}`,
          style: { "--dot": `var(--compare-${SERIES[index]})` },
          "aria-hidden": "true"
        }),
        el("span", { class: "compare-pair-name", text: entry.name })
      );
      const names = el(
        "div",
        { class: "compare-pair-names" },
        pairSide(state.selected[first], first),
        icon("fa-arrows-left-right"),
        pairSide(state.selected[second], second)
      );
      const score = el("strong", {
        class: "compare-pair-score",
        text: stats ? formatMatchPercent(stats.score) : "—"
      });
      const note = el("span", {
        class: "compare-pair-note",
        text: stats
          ? `${stats.shared === data.axes.length ? "12 de 12 eixos" : `${stats.shared} de 12 eixos`} em comum`
          : "Sem eixos em comum"
      });
      card.append(names, el("div", { class: "compare-pair-readout" }, score, note));
      elements.pairs.append(card);
    });
  };

  const valueChip = (entry, value, index) => {
    const chip = el("span", { class: `compare-value${value == null ? " is-unknown" : ""}` });
    chip.style.setProperty("--marker", `var(--compare-${SERIES[index]})`);
    chip.append(
      el("i", { "aria-hidden": "true" }),
      el(
        "span",
        {},
        `${entry.name} `,
        el("strong", { text: value == null ? "sem posição" : formatPercent(value) })
      )
    );
    return chip;
  };

  const renderReadout = (stats) => {
    const comparable = stats.filter((stat) => stat.spread != null);
    const agreement = comparable.length
      ? comparable.reduce((best, stat) => (stat.spread < best.spread ? stat : best))
      : null;
    const divergence = comparable.length
      ? comparable.reduce((best, stat) => (stat.spread > best.spread ? stat : best))
      : null;
    const opposite = stats.filter((stat) => stat.opposite);
    const names = state.selected.map((entry) => entry.name);

    elements.summary.textContent = agreement && divergence
      ? `Comparando ${names.join(", ")}. A maior convergência aparece em ${agreement.axis.name}; a maior distância, em ${divergence.axis.name}.`
      : `Comparando ${names.join(", ")}. Não há eixos suficientes em comum para resumir a distância.`;

    const createCard = ({ kicker, heading, text, values, className, href }) => {
      const card = el("article", { class: `compare-readout-card${className ? ` ${className}` : ""}` });
      const title = el("h4");
      if (href) title.append(el("a", { href, text: heading }));
      else title.textContent = heading;
      card.append(el("span", { class: "compare-kicker", text: kicker }), title, el("p", { text }));
      if (values?.length) {
        const list = el("div", { class: "compare-readout-values" });
        values.forEach(({ entry, value, index }) => list.append(valueChip(entry, value, index)));
        card.append(list);
      }
      return card;
    };

    const readoutCards = [];
    if (agreement) {
      readoutCards.push(createCard({
        kicker: "Onde mais concordam",
        heading: agreement.axis.name,
        text: `A amplitude entre as posições é de ${formatPoints(agreement.spread)} neste eixo.`,
        values: agreement.points.map((point) => ({ ...point, entry: point.entry })),
        href: `/teste-politico#eixo-${agreement.axis.id}`
      }));
    }
    if (divergence) {
      readoutCards.push(createCard({
        kicker: "Onde mais divergem",
        heading: divergence.axis.name,
        text: `A amplitude entre as posições é de ${formatPoints(divergence.spread)} neste eixo.`,
        values: divergence.points.map((point) => ({ ...point, entry: point.entry })),
        href: `/teste-politico#eixo-${divergence.axis.id}`
      }));
    }
    readoutCards.push(createCard({
      kicker: "Lados opostos",
      heading: opposite.length
        ? `${opposite.length} ${opposite.length === 1 ? "eixo" : "eixos"} em polos contrários`
        : "Nenhum eixo em polos contrários",
      text: opposite.length
        ? `Em ${opposite.map((stat) => stat.axis.name).slice(0, 4).join(", ")}${opposite.length > 4 ? ` e mais ${opposite.length - 4}` : ""}, os perfis escolhidos ficam em lados opostos do centro.`
        : "Os perfis escolhidos não se dividem entre os dois lados do centro em nenhum eixo.",
      className: "is-opposite"
    }));
    elements.readout.replaceChildren(...readoutCards);
  };

  const renderAxes = (stats) => {
    elements.axes.replaceChildren();
    stats.forEach((stat) => {
      const row = el("div", { class: `compare-axis${stat.opposite ? " is-opposite" : ""}` });
      const note = stat.spread == null
        ? "Comparação parcial"
      : `${formatPoints(stat.spread)} de amplitude${stat.opposite ? ", em lados opostos" : ""}`;
      const head = el(
        "div",
        { class: "compare-axis-head" },
        el("h4", {}, el("a", { href: `/teste-politico#eixo-${stat.axis.id}`, text: stat.axis.name })),
        el("span", { text: note })
      );

      const track = el("div", {
        class: "compare-track",
        role: "img",
        "aria-label": [
          stat.axis.name,
          ...stat.points.map((point) =>
            point.value == null ? `${point.entry.name}: sem posição definida` : `${point.entry.name}: ${formatPercent(point.value)}`
          )
        ].join(", ")
      });
      stat.points.forEach((point) => {
        if (point.value == null) return;
        const marker = el("span", {
          class: `compare-marker is-series-${point.index}`,
          title: `${point.entry.name}: ${formatPercent(point.value)}`
        });
        marker.style.setProperty("--marker", `var(--compare-${SERIES[point.index]})`);
        marker.style.setProperty("left", `${100 - point.value}%`);
        marker.setAttribute("aria-hidden", "true");
        track.append(marker);
      });
      track.append(el("span", { class: "compare-track-center", "aria-hidden": "true" }));

      const poles = el(
        "div",
        { class: "compare-poles" },
        el("span", { text: stat.axis.a }),
        el("span", { text: stat.axis.b })
      );

      const values = el("div", { class: "compare-values" });
      stat.points.forEach((point) => values.append(valueChip(point.entry, point.value, point.index)));

      row.append(head, track, poles, values);
      elements.axes.append(row);
    });
  };

  const matchRing = (score, color, size = "md") => {
    const ring = el("div", {
      class: `compare-ring is-${size}`,
      role: "img",
      "aria-label": `Compatibilidade: ${formatMatchPercent(score)}`
    });
    const safeScore = clamp(0, 100, score);
    ring.style.setProperty("--ring-color", color || "var(--primary)");
    ring.style.setProperty("--ring-value", `${safeScore * 3.6}deg`);
    ring.style.setProperty("--ring-percent", `${safeScore}%`);
    ring.append(
      el(
        "span",
        { class: "compare-ring-label" },
        el("strong", { text: formatPercent(score) }),
        el("small", { text: "match" })
      )
    );
    return ring;
  };

  const nearMetaFor = (entry) => {
    const item = entry.item;
    if (entry.group === "personalidades") {
      return [item.papel || item.role || item.areaLabel, item.periodo].filter(Boolean).join(", ");
    }
    if (entry.group === "paises" || entry.group === "regimes") {
      return [item.categoria, item.periodo].filter(Boolean).join(", ");
    }
    if (entry.group === "partidos") {
      return [
        entry.type,
        placeNameById.get(item.paisId),
        item.periodo
      ].filter(Boolean).join(", ");
    }
    if (entry.group === "ideologias") {
      return [item.categoria, item.periodo].filter(Boolean).join(", ");
    }
    return entry.meta;
  };

  const nearWho = (entry) => el(
    "p",
    { class: "compare-near-who" },
    avatarFor(entry, true),
    el("span", {}, "Mais perto de ", el("strong", { text: entry.name }))
  );

  const partyFlag = (entry) => {
    if (entry.group !== "partidos") return null;
    const place = placeById.get(entry.item.paisId);
    if (!place?.imagePath) return null;
    return el("img", {
      class: "compare-near-flag",
      src: place.imagePath,
      alt: `Bandeira de ${nameOf(place)}`,
      loading: "lazy"
    });
  };

  const nearCard = (target, ranked, targetIndex, kind) => {
    const [top, ...also] = ranked;
    if (!top) return null;
    const card = el("article", { class: `compare-near-card is-${kind}` });
    card.style.setProperty("--target-color", `var(--compare-${SERIES[targetIndex]})`);

    const info = el(
      "div",
      { class: "compare-near-info" },
      el(
        "span",
        { class: "compare-near-tags" },
        partyFlag(top.entry),
        el("span", {
          class: "compare-match-pill",
          text: `${formatMatchPercent(top.score)} match`
        })
      ),
      el("h4", {}, el("a", { href: catalogUrlFor(top.entry), text: top.entry.name })),
      el("span", { class: "compare-near-meta", text: nearMetaFor(top.entry) })
    );

    const main = el(
      "div",
      { class: "compare-near-main" },
      el("div", { class: "compare-near-visual" }, avatarFor(top.entry)),
      info,
      matchRing(top.score, top.entry.color, "sm")
    );

    card.append(nearWho(target), main);

    if (also.length) {
      const list = el("ol", { class: "compare-near-list" });
      also.forEach(({ entry, score }) => {
        list.append(el(
          "li",
          {},
          el("a", { href: catalogUrlFor(entry), text: entry.name }),
          el("span", { text: formatMatchPercent(score) })
        ));
      });
      card.append(
        el(
          "div",
          { class: "compare-near-also" },
          el("span", { class: "compare-kicker", text: "Também próximos" }),
          list
        )
      );
    }
    return card;
  };

  const renderNearCards = (host, pool, kind) => {
    host.replaceChildren();
    const available = pool.filter((entry) => !isSelected(entry.key));
    state.selected.forEach((target, index) => {
      const ranked = rankEntries(target, available, 3);
      const card = nearCard(target, ranked, index, kind);
      if (card) host.append(card);
    });
    if (!host.children.length) {
      host.append(el("p", {
        class: "compare-empty-note",
        text: "Não há perfis suficientes neste recorte para montar o ranking."
      }));
    }
  };

  const renderIdeologies = () => {
    const host = elements.ideology;
    host.replaceChildren();
    const pool = groupPool("ideologias").filter((entry) => !isSelected(entry.key));
    const common = commonVector();
    const commonTop = rankAgainstVector(common.values, common.indexes, pool, 1)[0];
    const layout = el("div", { class: "compare-ideology-layout" });

    if (commonTop) {
      const item = commonTop.entry.item;
      const commonCard = el(
        "article",
        { class: "compare-common-ideology" },
        el(
          "div",
          { class: "compare-common-copy" },
          el("span", { class: "compare-kicker", text: "Em comum" }),
          el("h4", {}, el("a", {
            href: catalogUrlFor(commonTop.entry),
            text: commonTop.entry.name
          })),
          el("span", {
            class: "compare-common-family",
            text: item.categoria || familiesById.get(item.familia)?.rotulo || "Ideologia"
          }),
          el("p", {
            class: "compare-common-desc",
            text: item.resumo || item.summary || item.description || ""
          }),
          el("span", {
            class: "compare-common-note",
            text: `Média de ${state.selected.length} perfis; ${common.indexes.length} de 12 eixos`
          })
        ),
        matchRing(commonTop.score, commonTop.entry.color, "lg")
      );
      commonCard.style.setProperty("--match-color", commonTop.entry.color);
      layout.append(commonCard);
    }

    const nearGrid = el("div", { class: "compare-ideology-near" });
    state.selected.forEach((target) => {
      const top = rankEntries(target, pool, 1)[0];
      if (!top) return;
      const item = top.entry.item;
      const card = el(
        "article",
        { class: "compare-ideology-card" },
        nearWho(target),
        el(
          "div",
          { class: "compare-ideology-main" },
          el(
            "div",
            { class: "compare-ideology-copy" },
            el("span", {
              class: "compare-tag",
              text: item.categoria || familiesById.get(item.familia)?.rotulo || "Ideologia"
            }),
            el("h4", {}, el("a", { href: catalogUrlFor(top.entry), text: top.entry.name })),
            el("p", {
              class: "compare-ideology-desc",
              text: item.resumo || item.summary || item.description || ""
            }),
            el("a", {
              class: "compare-inline-link",
              href: catalogUrlFor(top.entry),
              text: `Saber mais sobre ${top.entry.name}`
            })
          ),
          matchRing(top.score, top.entry.color, "sm")
        )
      );
      nearGrid.append(card);
    });
    if (nearGrid.children.length) layout.append(nearGrid);

    if (layout.children.length) host.append(layout);
    else host.append(el("p", {
      class: "compare-empty-note",
      text: "O catálogo não tem ideologias comparáveis a esta seleção."
    }));
  };

  const setTabState = (host, mode) => {
    if (!host) return;
    host.querySelectorAll("[data-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    });
  };

  const renderCountries = () => {
    setTabState(elements.countryTabs, state.countryMode);
    renderNearCards(elements.countries, countryPool(), "country");
  };

  const renderPersonalities = () => {
    renderNearCards(elements.personalities, groupPool("personalidades"), "personality");
  };

  const renderParties = () => {
    setTabState(elements.partyTabs, state.partyMode);
    renderNearCards(elements.parties, partyPool(), "party");
  };

  const renderValues = () => {
    elements.values.replaceChildren();
    (data.valueGroups || []).forEach((group) => {
      const picks = state.selected
        .map((target) => ({ target, top: rankValues(target, group.id)[0] }))
        .filter((pick) => pick.top);
      if (!picks.length) return;
      const color = VALUE_GROUP_COLORS[group.id] || "#0b766b";
      const card = el("article", { class: "compare-value-family" });
      card.style.setProperty("--family-color", color);
      const head = el(
        "header",
        { class: "compare-value-family-head" },
        el("span", { class: "compare-value-icon" }, icon(VALUE_GROUP_ICONS[group.id] || "fa-circle-dot")),
        el(
          "div",
          { class: "compare-value-family-title" },
          el("h4", { text: group.label })
        )
      );
      const rows = el("div", { class: "compare-value-picks" });
      picks.forEach(({ target, top }) => {
        rows.append(el(
          "div",
          { class: "compare-value-pick" },
          avatarFor(target, true),
          el("span", { class: "compare-value-pick-who", text: target.name }),
          el("a", {
            class: "compare-value-pick-value",
            href: catalogUrlFor(top.entry),
            text: top.entry.name
          }),
          el("span", {
            class: "compare-value-pick-score",
            text: formatMatchPercent(top.score)
          })
        ));
      });
      card.append(head, rows);
      elements.values.append(card);
    });
    if (!elements.values.children.length) {
      elements.values.append(el("p", {
        class: "compare-empty-note",
        text: "Não há famílias de valores comparáveis a esta seleção."
      }));
    }
  };

  const compassMarker = (entry, index, compass, extraClass = "") => {
    const marker = el("span", {
      class: `compare-compass-marker${extraClass ? ` ${extraClass}` : ""}`,
      title: `${entry.name}: ${formatPercent(compass.right)} à direita, ${formatPercent(compass.authoritarian)} autoritário, ${formatPercent(compass.traditional)} tradicionalista`,
      "aria-hidden": "true"
    });
    marker.style.setProperty("--marker", `var(--compare-${SERIES[index]})`);
    marker.style.setProperty("--compass-color", compass.region?.base || "#4B5058");
    const { path, alt, variant } = imageInfoFor(entry);
    const fallback = el("span", {
      class: "compare-compass-initials",
      "aria-hidden": "true",
      text: initials(entry.name)
    });
    if (path) {
      if (variant) marker.classList.add(variant);
      const image = el("img", {
        src: path,
        alt,
        loading: "lazy",
        decoding: "async"
      });
      image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
      marker.append(image);
    } else {
      marker.append(fallback);
    }
    return marker;
  };

  const renderCompass = () => {
    const host = elements.compass;
    host.replaceChildren();
    const compasses = state.selected.map((entry, index) => ({
      entry,
      index,
      compass: computeCompass(entry)
    }));

    const chart = el("div", {
      class: "compare-compass-chart",
      role: "img",
      "aria-label": `Bússola política: ${compasses.map(({ entry, compass }) =>
        `${entry.name}, ${formatPercent(compass.right)} à direita, ${formatPercent(compass.authoritarian)} autoritário, ${formatPercent(compass.traditional)} tradicionalista`
      ).join("; ")}.`
    });
    const label = (text, modifier) =>
      el("span", { class: `compare-compass-lbl ${modifier}`, text });
    const grid = el("div", { class: "compare-compass-grid" });
    COMPASS_GRID_COLORS.forEach((color) => {
      const cell = el("span", { "aria-hidden": "true" });
      cell.style.background = color;
      grid.append(cell);
    });
    grid.append(
      el("i", { class: "compare-compass-axis is-x", "aria-hidden": "true" }),
      el("i", { class: "compare-compass-axis is-y", "aria-hidden": "true" })
    );
    compasses.forEach(({ entry, index, compass }) => {
      const marker = compassMarker(entry, index, compass);
      marker.style.left = `${clamp(4, 96, compass.right)}%`;
      marker.style.top = `${clamp(4, 96, 100 - compass.authoritarian)}%`;
      marker.style.zIndex = String(3 + index);
      grid.append(marker);
    });
    chart.append(
      label("Autoritarismo", "is-top"),
      label("Esquerda", "is-left"),
      grid,
      label("Direita", "is-right"),
      label("Anarquismo", "is-bottom")
    );

    const read = el("div", { class: "compare-compass-read" });
    const legend = el("ul", {
      class: "compare-compass-legend",
      "aria-label": "Legenda da bússola"
    });
    compasses.forEach(({ entry, index, compass }) => {
      const item = el("li", {});
      const avatar = avatarFor(entry, true);
      avatar.classList.add("is-compass-legend");
      avatar.style.setProperty("--avatar-color", `var(--compare-${SERIES[index]})`);
      item.append(
        avatar,
        el(
          "span",
          { class: "compare-compass-legend-text" },
          el("strong", { text: entry.name }),
          el(
            "small",
            {},
            el("i", {
              style: { "--dot": compass.region.base },
              "aria-hidden": "true"
            }),
            `${COMPASS_SPECTRUM_LABELS[compass.regionKey] || "Centro"} (${formatPercent(compass.right)} à direita), ${formatPercent(compass.authoritarian)} autoritário, ${formatPercent(compass.traditional)} tradicionalista`
          )
        )
      );
      legend.append(item);
    });

    const bar = el("div", { class: "compare-compass-bar" });
    bar.append(
      el(
        "div",
        { class: "compare-compass-bar-lbls" },
        el("span", { text: "Progressista" }),
        el("span", { text: "Tradicionalista" })
      )
    );
    const strip = el("div", { class: "compare-compass-strip", "aria-hidden": "true" });
    COMPASS_STRIP_COLORS.forEach((color) => {
      const cell = el("span", {});
      cell.style.background = color;
      strip.append(cell);
    });
    compasses.forEach(({ entry, index, compass }) => {
      const marker = compassMarker(entry, index, compass, "is-strip");
      marker.style.left = `${clamp(4, 96, compass.traditional)}%`;
      marker.style.background = compass.socialColor;
      marker.style.zIndex = String(3 + index);
      strip.append(marker);
    });
    bar.append(strip);

    read.append(
      legend,
      bar,
      el("p", {
        class: "compare-compass-note",
        text: "Usa 5 dos 12 eixos; os sete restantes não entram no mapa."
      })
    );

    host.append(el("div", { class: "compare-compass-layout" }, chart, read));
  };

  const renderResults = () => {
    const stats = data.axes.map((axis, index) => {
      const points = state.selected.map((entry, pointIndex) => ({
        entry,
        index: pointIndex,
        value: valueFor(entry.item, axis, index)
      }));
      const known = points.filter((point) => point.value != null);
      const values = known.map((point) => point.value);
      return {
        axis,
        index,
        points,
        spread: values.length >= 2 ? Math.max(...values) - Math.min(...values) : null,
        opposite: values.length >= 2 && Math.min(...values) < 50 && Math.max(...values) > 50
      };
    });
    renderPairs();
    renderReadout(stats);
    renderLegend();
    renderAxes(stats);
    renderIdeologies();
    renderCountries();
    renderPersonalities();
    renderParties();
    renderValues();
    renderCompass();
  };

  const closeSuggestions = () => {
    elements.options.hidden = true;
    elements.input.setAttribute("aria-expanded", "false");
    elements.input.removeAttribute("aria-activedescendant");
    state.activeIndex = -1;
    optionButtons.forEach((button) => button.classList.remove("is-active"));
  };

  const setActive = (index) => {
    if (!optionButtons.length) return;
    state.activeIndex = (index + optionButtons.length) % optionButtons.length;
    optionButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === state.activeIndex);
      button.setAttribute("aria-selected", String(buttonIndex === state.activeIndex));
    });
    const active = optionButtons[state.activeIndex];
    elements.input.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  };

  const optionFor = (entry, index) => {
    const item = el("li", { role: "presentation" });
    const button = el("button", {
      class: "compare-option",
      type: "button",
      id: `compare-option-${index}`,
      role: "option",
      "aria-selected": "false",
      tabindex: "-1"
    });
    button.append(
      avatarFor(entry, true),
      el(
        "span",
        { class: "compare-option-text" },
        el("span", { class: "compare-option-name", text: entry.name }),
        el("span", { class: "compare-option-meta", text: entry.meta || entry.groupLabel })
      ),
      el("span", { class: "compare-option-type", text: entry.type })
    );
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => choose(entry));
    item.append(button);
    return item;
  };

  const renderSuggestions = () => {
    if (state.selected.length >= MAX_PROFILES) {
      closeSuggestions();
      return;
    }
    const matches = findMatches(elements.input.value);
    optionButtons = [];
    elements.options.replaceChildren();
    state.activeIndex = -1;
    elements.input.removeAttribute("aria-activedescendant");

    if (!matches.length) {
      if (elements.input.value.trim()) {
        const empty = el("li", {
          class: "compare-no-results",
          role: "presentation",
          text: "Nenhum perfil encontrado."
        });
        elements.options.append(empty);
        elements.options.hidden = false;
        elements.input.setAttribute("aria-expanded", "true");
      } else {
        closeSuggestions();
      }
      return;
    }

    if (!elements.input.value.trim()) {
      const label = state.selected.length
        ? `Próximos de ${state.selected.map((entry) => entry.name).join(" e ")}`
        : "Sugestões do catálogo";
      elements.options.append(
        el("li", { class: "compare-option-group", role: "presentation", text: label })
      );
    }

    matches.forEach((entry, index) => {
      const option = optionFor(entry, index);
      optionButtons.push(option.querySelector("button"));
      elements.options.append(option);
    });
    elements.options.hidden = false;
    elements.input.setAttribute("aria-expanded", "true");
  };

  const choose = (entry) => {
    if (!entry || state.selected.length >= MAX_PROFILES || isSelected(entry.key)) return;
    state.selected.push(entry);
    elements.input.value = "";
    state.query = "";
    closeSuggestions();
    elements.status.textContent = `${entry.name} adicionado à comparação.`;
    render();
    if (state.selected.length >= MAX_PROFILES) {
      elements.selected.querySelector(".compare-profile-remove:last-of-type")?.focus({ preventScroll: true });
    } else {
      elements.input.focus({ preventScroll: true });
    }
  };

  const removeEntry = (key) => {
    const index = state.selected.findIndex((entry) => entry.key === key);
    if (index < 0) return;
    const [removed] = state.selected.splice(index, 1);
    elements.status.textContent = `${removed.name} removido da comparação.`;
    render();
    elements.input.focus({ preventScroll: true });
  };

  const renderPicker = () => {
    const full = state.selected.length >= MAX_PROFILES;
    elements.picker.hidden = full;
    elements.limit.hidden = !full;
    elements.clear.hidden = state.selected.length === 0;
    elements.hint.hidden = full;
    if (state.selected.length === 0) {
      elements.hint.textContent = "Comece por uma ideologia, personalidade, país, regime, partido ou valor.";
    } else {
      elements.hint.textContent = "Adicione outro perfil para comparar os 12 eixos.";
    }
  };

  const renderEmpty = () => {
    const empty = state.selected.length < 2;
    elements.empty.hidden = !empty;
    if (!empty) return;
    elements.empty.replaceChildren(
      icon("fa-code-compare"),
      el("p", {
        text: state.selected.length === 0
          ? "Selecione dois ou três perfis do catálogo para comparar as posições nos 12 eixos."
          : "Agora escolha mais um perfil no campo acima para liberar a comparação lado a lado."
      })
    );
  };

  const buildUrl = () => {
    const path = window.location.pathname === "/comparar.html" ? "/comparar" : window.location.pathname;
    if (!state.selected.length) return path;
    const tokens = state.selected.map((entry) => `${entry.group}:${encodeURIComponent(entry.item.id)}`);
    return `${path}?perfis=${tokens.join(",")}`;
  };

  const syncUrl = () => {
    try {
      window.history.replaceState(null, "", buildUrl());
    } catch {
      // URLs longas ou ambientes sem histórico não impedem a comparação local.
    }
  };

  const render = () => {
    renderSelected();
    renderPicker();
    renderEmpty();
    elements.results.hidden = state.selected.length < 2;
    if (state.selected.length >= 2) renderResults();
    syncUrl();
  };

  const slugOf = (value) => {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.origin);
      return url.pathname.split("/").filter(Boolean).pop() || "";
    } catch {
      return "";
    }
  };

  const resolveEntry = (groupKey, rawId) => {
    const id = String(rawId || "").trim();
    if (!id) return null;
    const normalizedId = normalize(id);
    const candidates = GROUP_CANDIDATES[groupKey] || [groupKey];
    for (const candidate of candidates) {
      const direct = state.byKey.get(`${candidate}:${id}`);
      if (direct) return direct;
      const group = groups.find((entry) => entry.key === candidate);
      if (!group) continue;
      const item = group.items.find((entry) => {
        if (normalize(entry.id) === normalizedId) return true;
        const sourceSlug = slugOf(entry.source);
        if (sourceSlug && normalize(sourceSlug) === normalizedId) return true;
        const imageSlug = slugOf(entry.imagePath || entry.logoPath);
        const imageBase = imageSlug.replace(/\.[a-z0-9]+$/i, "");
        return Boolean(imageBase) && normalize(imageBase) === normalizedId;
      });
      if (item) return state.byKey.get(`${candidate}:${item.id}`) || null;
    }
    return null;
  };

  const parseUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const explicit = params.get("perfis") || params.get("perfil");
    const raw = explicit || params.get("items") || "";
    if (!raw) return [];
    const selected = [];
    const seen = new Set();
    raw.split(",").forEach((token) => {
      const trimmed = token.trim();
      const separator = trimmed.indexOf(":");
      if (separator < 1) return;
      const rawGroup = trimmed.slice(0, separator);
      let id;
      try {
        id = decodeURIComponent(trimmed.slice(separator + 1));
      } catch {
        return;
      }
      const group = explicit
        ? rawGroup
        : GROUP_ALIASES[normalize(rawGroup)] || "";
      if (!group) return;
      let entry = resolveEntry(group, id);
      if (!entry && group === "ideologias" && id.startsWith("valor-")) {
        entry = state.byKey.get(`valores:${id.slice("valor-".length)}`);
      }
      if (!entry || seen.has(entry.key) || selected.length >= MAX_PROFILES) return;
      seen.add(entry.key);
      selected.push(entry);
    });
    return selected;
  };

  const handleKeydown = (event) => {
    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const active = document.activeElement;
      const typing = active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable);
      if (!typing && state.selected.length < MAX_PROFILES) {
        event.preventDefault();
        elements.input.focus();
        renderSuggestions();
      }
      return;
    }
    if (event.target !== elements.input) return;
    if (event.key === "Escape") {
      closeSuggestions();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (elements.options.hidden) {
        renderSuggestions();
        if (!optionButtons.length) return;
        setActive(event.key === "ArrowDown" ? 0 : optionButtons.length - 1);
        return;
      }
      if (!optionButtons.length) return;
      if (event.key === "ArrowDown") setActive(state.activeIndex < 0 ? 0 : state.activeIndex + 1);
      else setActive(state.activeIndex < 0 ? optionButtons.length - 1 : state.activeIndex - 1);
      return;
    }
    if (event.key === "Enter" && !elements.options.hidden && optionButtons.length) {
      event.preventDefault();
      optionButtons[state.activeIndex >= 0 ? state.activeIndex : 0].click();
    }
  };

  const bindEvents = () => {
    elements.input.addEventListener("input", () => {
      state.query = elements.input.value;
      renderSuggestions();
    });
    elements.input.addEventListener("focus", renderSuggestions);
    elements.clear.addEventListener("click", () => {
      if (!state.selected.length) return;
      state.selected = [];
      elements.input.value = "";
      closeSuggestions();
      elements.status.textContent = "Seleção limpa.";
      render();
      elements.input.focus({ preventScroll: true });
    });
    document.addEventListener("pointerdown", (event) => {
      if (!elements.picker.contains(event.target)) closeSuggestions();
    });
    document.addEventListener("focusin", (event) => {
      if (!elements.picker.contains(event.target)) closeSuggestions();
    });
    document.addEventListener("keydown", handleKeydown);
    elements.countryTabs?.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.countryMode = button.dataset.mode;
        renderCountries();
      });
    });
    elements.partyTabs?.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.partyMode = button.dataset.mode;
        renderParties();
      });
    });
    window.addEventListener("popstate", () => {
      state.selected = parseUrl();
      closeSuggestions();
      render();
    });
  };

  const cacheElements = () => {
    elements = {
      workbench: document.getElementById("compare-workbench"),
      stats: document.getElementById("compare-stats"),
      selected: document.getElementById("compare-selected"),
      picker: document.getElementById("compare-picker"),
      input: document.getElementById("compare-search"),
      options: document.getElementById("compare-options"),
      hint: document.getElementById("compare-hint"),
      limit: document.getElementById("compare-limit"),
      status: document.getElementById("compare-status"),
      clear: document.getElementById("compare-clear"),
      empty: document.getElementById("compare-empty"),
      error: document.getElementById("compare-error"),
      results: document.getElementById("compare-results"),
      summary: document.getElementById("compare-summary"),
      pairs: document.getElementById("compare-pairs"),
      readout: document.getElementById("compare-readout"),
      legend: document.getElementById("compare-legend"),
      axes: document.getElementById("compare-axes"),
      ideology: document.getElementById("compare-ideology-content"),
      countryTabs: document.getElementById("compare-country-tabs"),
      countries: document.getElementById("compare-countries"),
      personalities: document.getElementById("compare-personalities"),
      partyTabs: document.getElementById("compare-party-tabs"),
      parties: document.getElementById("compare-parties"),
      values: document.getElementById("compare-values"),
      compass: document.getElementById("compare-compass-content")
    };
  };

  const init = async () => {
    cacheElements();
    try {
      const response = await fetch("/data/political-catalog.json");
      if (!response.ok) throw new Error("Catálogo indisponível");
      data = await response.json();
      if (!data.profiles || !Array.isArray(data.axes) || data.axes.length !== 12) {
        throw new Error("Base do catálogo inválida");
      }
      familiesById = new Map((data.families || []).map((family) => [family.id, family]));
      areasById = new Map((data.areas || []).map((area) => [area.id, area]));
      valueGroupsById = new Map((data.valueGroups || []).map((group) => [group.id, group]));
      ideologyNameById = new Map(
        (data.profiles.ideologies || []).map((ideology) => [ideology.id, nameOf(ideology)])
      );
      placeNameById = new Map(
        [...(data.profiles.countries || []), ...(data.profiles.regimes || [])]
          .map((place) => [place.id, nameOf(place)])
      );
      placeById = new Map(
        [...(data.profiles.countries || []), ...(data.profiles.regimes || [])]
          .map((place) => [place.id, place])
      );
      groups = buildGroups();
      buildEntries();
      state.selected = parseUrl();
      renderStats();
      bindEvents();
      render();
      elements.workbench.setAttribute("aria-busy", "false");
    } catch (error) {
      console.error(error);
      elements.workbench.setAttribute("aria-busy", "false");
      elements.error.hidden = false;
      elements.picker.hidden = true;
      elements.empty.hidden = true;
      elements.results.hidden = true;
    }
  };

  init();
});
