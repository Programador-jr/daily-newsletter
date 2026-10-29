/**
 * Catálogo político — base unificada em 12 eixos.
 *
 * A página carrega /data/political-catalog.json e monta a listagem de
 * ideologias e valores inspirada no 12 Axes, além das categorias genéricas
 * de personalidades, países e regimes e partidos. A categoria vem da URL
 * (?catalogo=...) e a navegação entre elas é feita pela barra lateral
 * compartilhada. Os cartões, a impressão digital e a ficha reutilizam a
 * linguagem visual do atlas político.
 */
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("catalog-main");
  if (!main) return;

  const PAGE_SIZE = 36;
  const VALUE_ID_PREFIX = "valor-";
  const STRONG_THRESHOLD = 60;
  const SVG_NS = "http://www.w3.org/2000/svg";
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
  const VALUE_GROUP_DESCRIPTIONS = {
    politicos: "Regime, representação e organização do poder.",
    externa: "Diplomacia, soberania e relação com o mundo.",
    economicos: "Propriedade, mercado, trabalho e distribuição.",
    imigracao: "Fronteiras, pertencimento e diversidade cultural.",
    sociedade: "Costumes, religião, moral e direitos.",
    tecnologicos: "Ciência, inovação e limites da transformação."
  };
  const IDEOLOGY_PLACE_FALLBACKS = {
    marxismo: ["marxismo-leninismo", "comunismo"]
  };
  const IDEA_TITLE = "Ideologias e valores em doze dimensões.";
  const IDEA_DESCRIPTION =
    "Correntes e conceitos que disputam o poder, a economia e os costumes. Cada ficha reúne contexto, origem do vetor e uma impressão digital de doze eixos independentes.";

  const state = {
    tab: "ideologias",
    scope: "tudo",
    family: "",
    familyType: "",
    query: "",
    queryText: "",
    filters: {},
    axes: {},
    intensity: "any",
    sort: "curadoria",
    visible: PAGE_SIZE,
    filtered: [],
    filteredIdeas: []
  };

  let DATA;
  let MAPS;
  let TABS;
  let AXIS_INDEX;
  let FAMILY_COUNTS;
  let GROUP_COUNTS;
  let lastFocus = null;

  const normalize = (value) =>
    String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const periodBucket = (item) => {
    if (item.tipo === "pais" && !item.historico) return "Países atuais";
    const period = String(item.periodo || "");
    if (!period) return "Séculos XX e XXI";
    if (/a\.C\.|a\. e\. c\./i.test(period)) return "Antiguidade";
    const year = Number(period.match(/\d{3,4}/)?.[0] || 2000);
    if (year < 500) return "Antiguidade";
    if (year < 1500) return "Idade Média";
    if (year < 1800) return "Idade Moderna";
    if (year < 1900) return "Século XIX";
    return "Séculos XX e XXI";
  };

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

  const icon = (name, extraClass) =>
    el("i", { class: "fas " + name + (extraClass ? " " + extraClass : ""), "aria-hidden": "true" });

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

  const vectorSourceLabel = (item) =>
    item.vectorLabel || (item.vectorSource === "atlas" ? "Vetor atlas" : "12axes convertido");

  const matchScore = (vectorA, vectorB) => {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== 12 || vectorB.length !== 12) return 0;
    const total = vectorA.reduce((sum, value, index) => sum + Math.abs(value - vectorB[index]), 0);
    return Math.max(0, Math.round(100 - total / 12));
  };

  const itemKind = (item) => (item.tipo === "valor" ? "valor" : "ideologia");

  const compareUrlFor = (item) => {
    let group = "ideologias";
    let id = item.valueId || item.id;
    if (itemKind(item) === "valor") {
      group = "valores";
      id = item.valueId || String(item.id).replace(/^valor-/, "");
    } else if (state.tab === "paises") {
      group = MAPS.regimes.has(item.id) ? "regimes" : "paises";
    } else if (state.tab === "personalidades") {
      group = "personalidades";
    } else if (state.tab === "partidos") {
      group = "partidos";
    }
    return `/comparar?perfis=${group}:${encodeURIComponent(id)}`;
  };

  const compareProfileAction = (item) =>
    el(
      "div",
      { class: "catalog-profile-actions" },
      el(
        "a",
        { class: "atlas-button", href: compareUrlFor(item) },
        el("span", { text: "Comparar com…" }),
        icon("fa-code-compare")
      )
    );

  const buildIdeaItems = (data) => {
    const ideologies = data.profiles.ideologies || [];
    const values = (data.profiles.values || []).map((item) => ({
      ...item,
      id: `${VALUE_ID_PREFIX}${item.id}`,
      valueId: item.id
    }));
    return [...ideologies, ...values];
  };

  const buildMaps = (data, ideaItems) => {
    const byId = (list) => new Map((list || []).map((item) => [item.id, item]));
    const places = [...(data.profiles.countries || []), ...(data.profiles.regimes || [])];
    const maps = {
      families: byId(data.families),
      areas: byId(data.areas),
      ideologies: byId(data.profiles.ideologies),
      figures: byId(data.profiles.figures),
      countries: byId(data.profiles.countries),
      regimes: byId(data.profiles.regimes),
      places: byId(places),
      parties: byId(data.profiles.parties),
      values: byId(data.profiles.values),
      books: byId(data.books),
      valueGroups: new Map((data.valueGroups || []).map((group) => [group.id, group])),
      byTab: {
        ideologias: byId(ideaItems),
        personalidades: byId(data.profiles.figures),
        paises: byId(places),
        partidos: byId(data.profiles.parties)
      },
      placeList: places,
      figureList: data.profiles.figures || [],
      partyList: data.profiles.parties || []
    };
    maps.ideologyPlaces = new Map();
    places.forEach((place) => {
      (place.ideologias || []).forEach((id) => {
        if (!maps.ideologyPlaces.has(id)) maps.ideologyPlaces.set(id, []);
        maps.ideologyPlaces.get(id).push(place.id);
      });
    });
    maps.ideologyParties = new Map();
    maps.partyList.forEach((party) => {
      if (!party.ideologia) return;
      if (!maps.ideologyParties.has(party.ideologia)) maps.ideologyParties.set(party.ideologia, []);
      maps.ideologyParties.get(party.ideologia).push(party.id);
    });
    maps.ideologyFigures = new Map();
    maps.figureList.forEach((figure) => {
      if (!figure.ideologia) return;
      if (!maps.ideologyFigures.has(figure.ideologia)) maps.ideologyFigures.set(figure.ideologia, []);
      maps.ideologyFigures.get(figure.ideologia).push(figure.id);
    });
    maps.countryParties = new Map();
    maps.partyList.forEach((party) => {
      if (!party.paisId) return;
      if (!maps.countryParties.has(party.paisId)) maps.countryParties.set(party.paisId, []);
      maps.countryParties.get(party.paisId).push(party.id);
    });
    return maps;
  };

  const familyOf = (item) => MAPS.families.get(item.familia);
  const areaOf = (item) => MAPS.areas.get(item.area);
  const placeName = (id) => MAPS.places.get(id)?.nome || "";
  const partyName = (id) => MAPS.parties.get(id)?.nome || "";
  const ideologyName = (id) => MAPS.ideologies.get(id)?.nome || "";
  const figureName = (id) => MAPS.figures.get(id)?.nome || "";
  const bookName = (id) => MAPS.books.get(id)?.titulo || "";

  const groupMeta = (id) => {
    const group = MAPS.valueGroups.get(id);
    if (!group) return null;
    return {
      id: group.id,
      rotulo: group.label,
      cor: VALUE_GROUP_COLORS[group.id] || "var(--primary)",
      descricao: VALUE_GROUP_DESCRIPTIONS[group.id] || "Conceitos transversais do catálogo."
    };
  };

  const familyMeta = (id) => MAPS.families.get(id) || groupMeta(id);

  const familyIdForItem = (item) => (itemKind(item) === "valor" ? item.groupId : item.familia);

  const familyCount = (id) => FAMILY_COUNTS.get(id) || 0;
  const groupCount = (id) => GROUP_COUNTS.get(id) || 0;

  const relatedNames = (ids, getName) => (ids || []).map(getName).filter(Boolean).join(" ");

  const placeIdsForIdeology = (ideologyId) => {
    const relatedIds = [ideologyId, ...(IDEOLOGY_PLACE_FALLBACKS[ideologyId] || [])];
    const indexed = relatedIds.flatMap((id) => MAPS.ideologyPlaces.get(id) || []);
    const discovered = MAPS.placeList
      .filter((place) => Array.isArray(place.ideologias) && place.ideologias.some((id) => relatedIds.includes(id)))
      .map((place) => place.id);
    return [...new Set([...indexed, ...discovered])];
  };

  const nearestByVector = (item, entries) =>
    entries
      .filter((entry) => Array.isArray(entry.vetor) && entry.vetor.length === 12)
      .map((entry) => ({ entry, score: matchScore(item.vetor, entry.vetor) }))
      .sort((first, second) => second.score - first.score)
      .map(({ entry }) => entry);

  const referenceFiguresFor = (item) => {
    const related = unique([...(item.pensadores || []), ...(MAPS.ideologyFigures.get(item.id) || [])])
      .map((id) => MAPS.figures.get(id))
      .filter(Boolean);
    return related.length ? related : nearestByVector(item, MAPS.figureList).slice(0, 1);
  };

  const referencePlacesFor = (item) => {
    const related = placeIdsForIdeology(item.id).map((id) => MAPS.places.get(id)).filter(Boolean);
    return related.length ? related : nearestByVector(item, MAPS.placeList).slice(0, 1);
  };

  const colorFor = (item, tab) => {
    if (tab === "ideologias" || tab === "valores") {
      if (itemKind(item) === "valor") return groupMeta(item.groupId)?.cor || "var(--primary)";
      return familyOf(item)?.cor || "var(--primary)";
    }
    if (tab === "personalidades") return areaOf(item)?.cor || "var(--primary)";
    if (tab === "paises") return REGION_COLORS[item.regiao] || (item.historico ? "#8a4b3a" : "#35608f");
    if (tab === "partidos") {
      return (
        MAPS.families.get(item.espectro)?.cor ||
        MAPS.families.get(MAPS.ideologies.get(item.ideologia)?.familia)?.cor ||
        "#8f5a2e"
      );
    }
    return VALUE_GROUP_COLORS[item.groupId] || "var(--primary)";
  };

  const markFor = (item, tab) => {
    if (tab === "personalidades") return initials(item.nome);
    if (tab === "paises") return item.sigla || initials(item.nome);
    if (tab === "partidos") return item.sigla || initials(item.nome);
    return initials(item.nome);
  };

  const mediaFor = (item, tab) => {
    if (tab === "personalidades" && item.imagePath) {
      return { path: item.imagePath, kind: "portrait", alt: `Retrato de ${item.nome}` };
    }
    if (tab === "paises" && item.imagePath) {
      return { path: item.imagePath, kind: "flag", alt: `Bandeira ou símbolo de ${item.nome}` };
    }
    if (tab === "partidos" && (item.logoPath || item.imagePath)) {
      return {
        path: item.logoPath || item.imagePath,
        kind: "logo",
        alt: `Símbolo de ${item.nome}`
      };
    }
    return null;
  };

  const buildTabs = (ideaItems) => ({
    ideologias: {
      key: "ideologias",
      label: "Ideologias e valores",
      singular: "item",
      plural: "itens",
      eyebrow: "Catálogo político · Ideologias e valores",
      title: IDEA_TITLE,
      description: IDEA_DESCRIPTION,
      items: ideaItems,
      featured: [
        ...((DATA.featured && DATA.featured.ideologias) || []),
        ...(((DATA.featured && DATA.featured.valores) || []).map((id) => `${VALUE_ID_PREFIX}${id}`))
      ],
      featuredLabel: "Seleção editorial de ideologias e valores",
      searchPlaceholder: "Buscar ideologia, valor, ideia ou pensador...",
      colorOf: (item) => colorFor(item, "ideologias"),
      mark: (item) => markFor(item, "ideologias"),
      markClass: "",
      tags: (item) =>
        itemKind(item) === "valor"
          ? [item.group, "Valor", vectorSourceLabel(item)]
          : [familyOf(item)?.rotulo, item.periodo, vectorSourceLabel(item)],
      subtitle: (item) =>
        itemKind(item) === "valor"
          ? [item.group, `${(item.knownAxes || []).length} de 12 eixos definidos`].filter(Boolean).join(" · ")
          : item.ideia || item.detail || familyOf(item)?.descricao,
      kindLabel: (item) => (itemKind(item) === "valor" ? "Conceito" : null),
      summary: (item) => item.resumo || item.summary || item.description,
      descriptionText: (item) =>
        itemKind(item) === "valor"
          ? item.description || item.resumo
          : item.longDescription || item.description || item.resumo,
      searchText: (item) =>
        [
          item.nome,
          item.resumo,
          item.summary,
          item.ideia,
          item.detail,
          item.periodo,
          item.group,
          familyOf(item)?.rotulo,
          itemKind(item) === "valor" ? groupMeta(item.groupId)?.rotulo : "",
          relatedNames(item.pensadores, figureName),
          relatedNames(item.partidos, partyName)
        ].join(" "),
      filters: [],
      catalogCta: (item) => (itemKind(item) === "valor" ? "Ler a definição" : "Ler a ficha")
    },
    personalidades: {
      key: "personalidades",
      label: "Personalidades",
      singular: "personalidade",
      plural: "personalidades",
      eyebrow: "Catálogo político · Personalidades",
      title: "Trajetórias em doze dimensões.",
      description:
        "Pensadores, líderes e militantes que marcaram a política. A ficha contextualiza a trajetória, mostra o retrato com crédito e compara o perfil em doze eixos.",
      items: DATA.profiles.figures,
      featured: DATA.featured.personalidades,
      searchPlaceholder: "Buscar nome, área, país ou corrente...",
      colorOf: (item) => colorFor(item, "personalidades"),
      mark: (item) => markFor(item, "personalidades"),
      markClass: "",
      tags: (item) => [item.areaLabel || areaOf(item)?.rotulo, item.periodo, vectorSourceLabel(item)],
      subtitle: (item) => [item.papel || item.role, item.pais].filter(Boolean).join(" · "),
      summary: (item) => item.resumo || item.summary,
      descriptionText: (item) => item.longDescription || item.description || item.resumo,
      searchText: (item) =>
        [
          item.id,
          item.nome,
          item.papel,
          item.role,
          item.areaLabel,
          item.pais,
          item.periodo,
          item.resumo,
          item.summary,
          ideologyName(item.ideologia)
        ].join(" "),
      filters: [
        {
          key: "area",
          label: "Área",
          options: DATA.areas.map((area) => ({ value: area.id, label: area.rotulo })),
          get: (item) => item.area
        },
        {
          key: "origem",
          label: "Vetor",
          options: [
            { value: "atlas", label: "Vetor atlas" },
            { value: "12axes", label: "12axes convertido" }
          ],
          get: (item) => item.vectorSource
        }
      ],
      catalogCta: "Ver trajetória"
    },
    paises: {
      key: "paises",
      label: "Países e regimes",
      singular: "perfil",
      plural: "perfis",
      eyebrow: "Catálogo político · Países e regimes",
      title: "Países e regimes em doze dimensões.",
      description:
        "Estados contemporâneos e experiências históricas. Bandeiras, período, instituições e correntes associadas ajudam a ler cada configuração política sem reduzir tudo a um rótulo.",
      items: [...DATA.profiles.countries, ...DATA.profiles.regimes],
      featured: DATA.featured.paises,
      searchPlaceholder: "Buscar país, regime, região ou corrente...",
      colorOf: (item) => colorFor(item, "paises"),
      mark: (item) => markFor(item, "paises"),
      markClass: "atlas-mark-sigla",
      tags: (item) => [
        item.tipo === "regime" ? "Regime" : "País",
        item.regiao || item.periodo,
        vectorSourceLabel(item)
      ],
      subtitle: (item) => [item.periodo, item.regiao, item.categoria].filter(Boolean).join(" · "),
      summary: (item) => item.resumo || item.summary,
      descriptionText: (item) => item.longDescription || item.description || item.resumo,
      searchText: (item) =>
        [
          item.nome,
          item.periodo,
          item.regiao,
          item.categoria,
          item.resumo,
          relatedNames(item.ideologias, ideologyName),
          relatedNames(item.partidos, partyName)
        ].join(" "),
      filters: [
        {
          key: "tipo",
          label: "Tipo",
          options: [
            { value: "pais", label: "Países" },
            { value: "regime", label: "Regimes" }
          ],
          get: (item) => item.tipo
        },
        {
          key: "regiao",
          label: "Período",
          options: ["Antiguidade", "Idade Média", "Idade Moderna", "Século XIX", "Séculos XX e XXI"].map((period) => ({ value: period, label: period })),
          get: (item) => periodBucket(item)
        },
        {
          key: "origem",
          label: "Vetor",
          options: [
            { value: "atlas", label: "Vetor atlas" },
            { value: "12axes", label: "12axes convertido" }
          ],
          get: (item) => item.vectorSource
        }
      ],
      catalogCta: "Ver perfil do país"
    },
    partidos: {
      key: "partidos",
      label: "Partidos",
      singular: "partido",
      plural: "partidos",
      eyebrow: "Catálogo político · Partidos",
      title: "Partidos e movimentos em doze dimensões.",
      description:
        "Organizações que disputam eleições, constroem bases e ocupam instituições. A ficha reúne trajetória, país, corrente associada e o vetor de doze eixos.",
      items: DATA.profiles.parties,
      featured: DATA.featured.partidos,
      searchPlaceholder: "Buscar partido, sigla, país ou corrente...",
      colorOf: (item) => colorFor(item, "partidos"),
      mark: (item) => markFor(item, "partidos"),
      markClass: "atlas-mark-sigla",
      tags: (item) => [
        item.category || "Partido",
        placeName(item.paisId),
        item.periodo || vectorSourceLabel(item)
      ],
      subtitle: (item) => [item.orientacao, item.periodo].filter(Boolean).join(" · "),
      summary: (item) => item.resumo || item.summary,
      descriptionText: (item) => item.longDescription || item.description || item.resumo,
      searchText: (item) =>
        [
          item.id,
          item.nome,
          item.sigla,
          item.orientacao,
          item.periodo,
          item.resumo,
          placeName(item.paisId),
          ideologyName(item.ideologia),
          (item.marcos || []).join(" ")
        ].join(" "),
      filters: [
        {
          key: "tipo",
          label: "Tipo",
          options: [
            { value: "atual", label: "Atuais" },
            { value: "historico", label: "Históricos" }
          ],
          get: (item) => (item.historico ? "historico" : "atual")
        },
        {
          key: "categoria",
          label: "Categoria",
          options: [
            ...new Set(DATA.profiles.parties.map((item) => item.category).filter(Boolean))
          ].map((category) => ({ value: category, label: category })),
          get: (item) => item.category
        },
        {
          key: "origem",
          label: "Vetor",
          options: [
            { value: "atlas", label: "Vetor atlas" },
            { value: "12axes", label: "12axes convertido" }
          ],
          get: (item) => item.vectorSource
        }
      ],
      catalogCta: "Ver trajetória"
    }
  });

  const currentConfig = () => TABS[state.tab];

  const locationState = () => {
    const requested = new URLSearchParams(window.location.search).get("catalogo");
    const dedicated = document.body.dataset.catalogDefault;
    if (dedicated && TABS[dedicated]) return { tab: dedicated, scope: "tudo" };
    if (window.location.pathname === "/personalidades") return { tab: "personalidades", scope: "tudo" };
    if (window.location.pathname === "/paises") return { tab: "paises", scope: "tudo" };
    if (window.location.pathname === "/partidos") return { tab: "partidos", scope: "tudo" };
    if (requested === "valores") return { tab: "ideologias", scope: "valores" };
    if (requested === "ideologias") return { tab: "ideologias", scope: "ideologias" };
    if (TABS && TABS[requested] && requested !== "ideologias") return { tab: requested, scope: "tudo" };
    return { tab: "ideologias", scope: "tudo" };
  };

  const buildUrl = (tab, hash, scope) => {
    const url = new URL(window.location.href);
    const dedicatedPath = (tab === "personalidades" && window.location.pathname === "/personalidades") ||
      (tab === "paises" && window.location.pathname === "/paises") ||
      (tab === "partidos" && window.location.pathname === "/partidos");
    url.pathname = dedicatedPath ? window.location.pathname : "/catalogo-politico";
    url.search = "";
    if (tab !== "ideologias" && !dedicatedPath) {
      url.searchParams.set("catalogo", tab);
    } else if (scope === "valores") {
      url.searchParams.set("catalogo", "valores");
    } else if (scope === "ideologias") {
      url.searchParams.set("catalogo", "ideologias");
    }
    url.hash = hash ? encodeURIComponent(hash) : "";
    return url.pathname + url.search + url.hash;
  };

  const hashId = () => {
    try {
      return decodeURIComponent(window.location.hash.replace(/^#/, ""));
    } catch {
      return "";
    }
  };

  const notifyCatalogChange = () => {
    window.dispatchEvent(new CustomEvent("site:catalog-change"));
  };

  const syncCatalogUrl = () => {
    if (state.tab !== "ideologias") return;
    window.history.replaceState(null, "", buildUrl("ideologias", null, state.scope));
    notifyCatalogChange();
  };

  const scopeLabel = () => {
    if (state.scope === "valores") return "Valores";
    if (state.scope === "ideologias") return "Ideologias";
    return "Ideologias e valores";
  };

  const renderStats = () => {
    const stats = document.getElementById("catalog-stats");
    if (!stats) return;
    let entries;
    if (state.tab === "ideologias") {
      entries = [
        [DATA.profiles.ideologies.length, "ideologias"],
        [DATA.profiles.values.length, "valores"],
        [12, "eixos"],
        [DATA.families.length + (DATA.valueGroups || []).length, "recortes"]
      ];
    } else if (state.tab === "paises") {
      entries = [
        [DATA.profiles.countries.length + DATA.profiles.regimes.length, "perfis"],
        [DATA.profiles.countries.length, "países atuais"],
        [DATA.profiles.regimes.length, "regimes históricos"],
        [12, "eixos"]
      ];
    } else if (state.tab === "personalidades") {
      entries = [
        [DATA.profiles.figures.length, "personalidades"],
        [(DATA.areas || []).length, "áreas de atuação"],
        [12, "eixos por perfil"]
      ];
    } else if (state.tab === "partidos") {
      entries = [
        [DATA.profiles.parties.length, "perfis"],
        [DATA.profiles.parties.filter((item) => !item.historico).length, "organizações atuais"],
        [DATA.profiles.parties.filter((item) => item.historico).length, "históricos"],
        [12, "eixos"]
      ];
    } else {
      const config = currentConfig();
      const atlasCount = config.items.filter((item) => item.vectorSource === "atlas").length;
      entries = [[config.items.length, config.plural], [12, "eixos"]];
      if (atlasCount) entries.push([atlasCount, "vetores do atlas"]);
    }
    stats.classList.toggle("catalog-stats--three", entries.length === 3);
    stats.replaceChildren(
      ...entries.map(([value, label]) =>
        el(
          "div",
          { class: "catalog-stat" },
          el("strong", { text: String(value) }),
          el("span", { class: "catalog-stat-label", text: label })
        )
      )
    );
  };

  const renderHero = () => {
    const isIdeologies = state.tab === "ideologias";
    const config = currentConfig();
    const isCountries = state.tab === "paises";
    const eyebrow = document.getElementById("catalog-eyebrow");
    const title = document.getElementById("catalog-title");
    const description = document.getElementById("catalog-description");
    const crumb = document.getElementById("catalog-breadcrumb-current");
    if (eyebrow) {
      eyebrow.textContent = isIdeologies ? `Catálogo político · ${scopeLabel()}` : config.eyebrow;
    }
    if (title) title.textContent = isIdeologies ? IDEA_TITLE : config.title;
    if (description) description.textContent = isIdeologies ? IDEA_DESCRIPTION : config.description;
    if (crumb) crumb.textContent = isIdeologies ? scopeLabel() : config.label;
    const dedicatedPage = document.body.dataset.catalogDefault === state.tab;
    document.title = dedicatedPage
      ? `${config.label} | King's Newsletter`
      : `${isIdeologies ? scopeLabel() : config.label} · Catálogo político | King's Newsletter`;
    document.getElementById("catalog-ideology-view").hidden = !isIdeologies;
    document.getElementById("catalog-generic-view").hidden = isIdeologies;
    const genericSearch = document.getElementById("catalog-generic-search");
    if (genericSearch && config.searchPlaceholder) genericSearch.placeholder = isCountries ? "Buscar país ou regime..." : config.searchPlaceholder;
    const genericTitle = document.getElementById("catalog-generic-grid-title");
    if (genericTitle) genericTitle.textContent = isCountries ? "Países e regimes" : state.tab === "partidos" ? "Partidos e organizações" : "Explore as fichas";
    renderStats();
    renderCountrySpectrum();
    renderPersonalitySpectrum();
    renderPartySpectrum();
  };

  const renderCountrySpectrum = () => {
    const spectrum = document.getElementById("catalog-country-spectrum");
    if (!spectrum) return;
    if (state.tab !== "paises") {
      spectrum.hidden = true;
      spectrum.replaceChildren();
      return;
    }
    const countries = DATA.profiles.countries || [];
    const periods = ["Antiguidade", "Idade Média", "Idade Moderna", "Século XIX", "Séculos XX e XXI"];
    const counts = new Map(periods.map((period) => [period, DATA.profiles.regimes.filter((item) => periodBucket(item) === period).length]));
    const current = countries.length;
    spectrum.hidden = false;
    spectrum.replaceChildren(
      el("div", { class: "catalog-country-periods" },
        el("span", { class: "catalog-spectrum-title", text: "Recorte histórico" }),
        el("div", { class: "catalog-spectrum-bar" },
          el("button", { class: "catalog-spectrum-seg", type: "button", style: { "--n": String(current), "--c": "#35608f" }, title: `${current} países atuais` }, el("b", { text: "Países atuais" }), el("em", { text: String(current) })),
          ...periods.map((period) => el("button", { class: "catalog-spectrum-seg", type: "button", style: { "--n": String(counts.get(period) || 1), "--c": "#7a4090" }, title: `${counts.get(period) || 0} em ${period}` }, el("b", { text: period }), el("em", { text: String(counts.get(period) || 0) })))
        )
      )
    );
  };

  const renderPersonalitySpectrum = () => {
    const spectrum = document.getElementById("catalog-personality-spectrum");
    if (!spectrum) return;
    if (state.tab !== "personalidades") {
      spectrum.hidden = true;
      spectrum.replaceChildren();
      return;
    }
    const items = DATA.profiles.figures || [];
    const areas = DATA.areas || [];
    const counts = new Map(areas.map((area) => [area.id, items.filter((item) => item.area === area.id).length]));
    spectrum.hidden = false;
    spectrum.replaceChildren(
      el("div", { class: "catalog-country-periods" },
        el("span", { class: "catalog-spectrum-title", text: "Distribuição por área" }),
        el("div", { class: "catalog-spectrum-bar" }, areas.map((area) => el("button", { class: "catalog-spectrum-seg", type: "button", style: { "--n": String(counts.get(area.id) || 1), "--c": area.cor || "#35608f" }, title: `${area.rotulo}: ${counts.get(area.id) || 0}` }, el("b", { text: area.rotulo }), el("em", { text: String(counts.get(area.id) || 0) }))))
      )
    );
  };

  const renderPartySpectrum = () => {
    const spectrum = document.getElementById("catalog-party-spectrum");
    if (!spectrum) return;
    if (state.tab !== "partidos") {
      spectrum.hidden = true;
      spectrum.replaceChildren();
      return;
    }
    const items = DATA.profiles.parties || [];
    const categories = ["Partido", "Movimento", "Casa dinástica", "Organização armada"];
    const counts = new Map(categories.map((category) => [category, items.filter((item) => item.category === category).length]));
    spectrum.hidden = false;
    spectrum.replaceChildren(
      el("div", { class: "catalog-country-periods" },
        el("span", { class: "catalog-spectrum-title", text: "Distribuição por tipo de organização" }),
        el("div", { class: "catalog-spectrum-bar" }, categories.map((category) => {
          const labels = {
            Partido: "Partidos",
            Movimento: "Movimentos",
            "Casa dinástica": "Casas dinásticas",
            "Organização armada": "Organizações armadas"
          };
          return el("button", { class: "catalog-spectrum-seg", type: "button", style: { "--n": String(counts.get(category) || 1), "--c": ["#35608f", "#a33a57", "#8f5a2e", "#5a3b28"][categories.indexOf(category)] }, title: `${category}: ${counts.get(category) || 0}` }, el("b", { text: labels[category] || category }), el("em", { text: String(counts.get(category) || 0) }));
        }))
      )
    );
  };

  const axisHref = (axisId, pole) => {
    if (axisId === "imigracao") return `#pi-${axisId}-${pole === "a" ? "r" : "l"}`;
    return `#pi-${axisId}-${pole}`;
  };

  const poleName = (axis, pole) => (pole === "a" ? axis.a : axis.b);

  const axisSvg = (axis, pole, size) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", axisHref(axis.id, pole));
    svg.append(use);
    return svg;
  };

  const renderSpectrum = () => {
    const spectrum = document.getElementById("catalog-spectrum");
    if (!spectrum) return;
    if (state.tab !== "ideologias") {
      spectrum.hidden = true;
      spectrum.replaceChildren();
      return;
    }
    spectrum.hidden = false;
    const rows = [
      { label: "Ideologias", kind: "ideologia", items: DATA.families, count: familyCount },
      {
        label: "Valores",
        kind: "valor",
        items: (DATA.valueGroups || []).map((group) => groupMeta(group.id)).filter(Boolean),
        count: groupCount
      }
    ];
    spectrum.replaceChildren(
      el("h2", { class: "catalog-spectrum-title", text: "Distribuição por famílias e grupos" }),
      ...rows.map((row) => {
        const bar = el("div", { class: "catalog-spectrum-bar" });
        row.items.forEach((meta) => {
          const total = row.count(meta.id);
          const pressed = state.family === meta.id && state.familyType === row.kind;
          const segment = el("button", {
            class: "catalog-spectrum-seg",
            type: "button",
            style: { "--n": String(total), "--c": meta.cor },
            "aria-pressed": String(pressed),
            "aria-label": `${meta.rotulo}: ${total} ${row.kind === "valor" ? "valores" : "ideologias"}`,
            title: `${meta.rotulo}: ${total} ${row.kind === "valor" ? "valores" : "ideologias"}`
          });
          segment.append(el("b", { text: meta.rotulo }), el("em", { text: String(total) }));
          segment.addEventListener("click", () => toggleFamily(meta.id, row.kind));
          bar.append(segment);
        });
        return el(
          "div",
          { class: "catalog-spectrum-row" },
          el(
            "div",
            { class: "catalog-spectrum-head" },
            el("strong", { text: row.label }),
            el("span", { text: `${row.items.length} ${row.kind === "valor" ? "grupos" : "famílias"}` })
          ),
          bar
        );
      })
    );
  };

  const renderScope = () => {
    const container = document.getElementById("catalog-scope");
    if (!container) return;
    const options = [
      {
        value: "tudo",
        label: "Tudo",
        count: DATA.profiles.ideologies.length + DATA.profiles.values.length
      },
      { value: "ideologias", label: "Ideologias", count: DATA.profiles.ideologies.length },
      { value: "valores", label: "Valores", count: DATA.profiles.values.length }
    ];
    container.replaceChildren(
      ...options.map((option) => {
        const button = el("button", {
          class: "catalog-scope-button",
          type: "button",
          "aria-pressed": String(state.scope === option.value),
          "aria-label": `${option.label}: ${option.count} fichas`
        });
        button.textContent = option.label;
        button.addEventListener("click", () => applyScope(option.value));
        return button;
      })
    );
  };

  const refreshScopeControls = () => {
    renderHero();
    renderSpectrum();
    renderScope();
    renderChips();
  };

  const clearFamilyState = () => {
    state.family = "";
    state.familyType = "";
  };

  const toggleFamily = (id, kind) => {
    if (state.family === id && state.familyType === kind) {
      clearFamilyState();
    } else {
      state.family = id;
      state.familyType = kind;
      state.scope = kind === "valor" ? "valores" : "ideologias";
    }
    syncCatalogUrl();
    refreshScopeControls();
    applyIdeaFilters(true);
  };

  const applyScope = (scope) => {
    if (state.scope === scope) return;
    state.scope = scope;
    if (state.familyType === "ideologia" && scope === "valores") clearFamilyState();
    if (state.familyType === "valor" && scope === "ideologias") clearFamilyState();
    syncCatalogUrl();
    refreshScopeControls();
    applyIdeaFilters(true);
  };

  const renderChips = () => {
    const container = document.getElementById("catalog-chips");
    if (!container) return;
    const entries = [];
    if (state.scope !== "valores") {
      DATA.families.forEach((meta) => {
        entries.push({ meta, kind: "ideologia", count: familyCount(meta.id) });
      });
    }
    if (state.scope !== "ideologias") {
      (DATA.valueGroups || []).forEach((group) => {
        const meta = groupMeta(group.id);
        if (meta) entries.push({ meta, kind: "valor", count: groupCount(meta.id) });
      });
    }
    container.replaceChildren(
      ...entries.map(({ meta, kind, count }) => {
        const pressed = state.family === meta.id && state.familyType === kind;
        const chip = el("button", {
          class: "catalog-chip",
          type: "button",
          style: { "--c": meta.cor },
          "aria-pressed": String(pressed),
          title: `${meta.rotulo}: ${count} ${kind === "valor" ? "valores" : "ideologias"}`
        });
        chip.append(
          el("span", { class: "catalog-chip-dot" }),
          el("span", { text: meta.rotulo }),
          el("em", { text: String(count) })
        );
        chip.addEventListener("click", () => toggleFamily(meta.id, kind));
        return chip;
      })
    );
  };

  const renderLegend = () => {
    const list = document.getElementById("catalog-legend");
    if (!list) return;
    list.replaceChildren(
      ...DATA.axes.map((axis) =>
        el(
          "li",
          {},
          el("span", { class: "catalog-legend-name", text: axis.name }),
          el(
            "span",
            { class: "catalog-legend-poles" },
            el(
              "span",
              { class: "catalog-legend-pole", title: axis.aDesc || axis.a },
              axisSvg(axis, "a", 13),
              el("span", { text: axis.a })
            ),
            el(
              "span",
              { class: "catalog-legend-pole", title: axis.bDesc || axis.b },
              axisSvg(axis, "b", 13),
              el("span", { text: axis.b })
            )
          )
        )
      )
    );
  };

  const isAxisKnown = (item, axisId) => {
    if (itemKind(item) !== "valor") return true;
    if (!Array.isArray(item.knownAxes)) return true;
    return item.knownAxes.includes(axisId);
  };

  const axisValue = (item, axisId) => {
    if (!isAxisKnown(item, axisId)) return null;
    const index = AXIS_INDEX.get(axisId);
    if (index == null) return null;
    const value = Number(item.vetor?.[index]);
    if (!Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, value));
  };

  const buildDna = (item) => {
    const wrap = el("span", {
      class: "catalog-dna",
      role: "img",
      "aria-label": `Impressão digital em doze eixos de ${item.nome}`
    });
    DATA.axes.forEach((axis) => {
      const value = axisValue(item, axis.id);
      if (value == null) {
        wrap.append(
          el("span", {
            class: "catalog-dna-dot",
            title: `${axis.name}: sem posição definida`,
            "aria-hidden": "true"
          })
        );
        return;
      }
      const pole = value >= 50 ? "a" : "b";
      const strength = Math.max(value, 100 - value);
      const svg = axisSvg(axis, pole, 14);
      svg.style.opacity = (0.35 + (strength / 100) * 0.65).toFixed(2);
      const title = document.createElementNS(SVG_NS, "title");
      title.textContent = `${axis.name}: ${Math.round(strength)}% ${poleName(axis, pole)}`;
      svg.prepend(title);
      wrap.append(svg);
    });
    return wrap;
  };

  const makeIdeaCard = (item) => {
    const kind = itemKind(item);
    const color = colorFor(item, "ideologias");
    const card = el("li", { class: "catalog-idea-card", style: { "--c": color } });
    const link = el("a", {
      href: "#" + encodeURIComponent(item.id),
      "aria-label": `Abrir ficha de ${item.nome}`
    });
    const summary = currentConfig().summary(item);
    const foot = el("span", { class: "catalog-idea-foot" });
    foot.append(
      buildDna(item),
      el(
        "span",
        { class: "catalog-idea-go" },
        el("span", { text: kind === "valor" ? "Ler definição" : "Ler ficha" }),
        icon("fa-arrow-right")
      )
    );
    link.append(
      el("span", { class: "catalog-idea-kind", text: kind === "valor" ? "Valor" : "Ideologia" }),
      el("h3", { text: item.nome }),
      el("p", { class: "catalog-idea-summary", text: summary || "" }),
      foot
    );
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openItem(item, "ideologias");
    });
    card.append(link);
    return card;
  };

  const groupFilteredIdeas = () => {
    const buckets = new Map();
    state.filteredIdeas.forEach((item) => {
      const id = familyIdForItem(item);
      if (!buckets.has(id)) buckets.set(id, []);
      buckets.get(id).push(item);
    });
    const groups = [];
    if (state.scope !== "valores") {
      DATA.families.forEach((meta) => {
        const items = buckets.get(meta.id);
        if (items && items.length) groups.push({ meta, kind: "ideologia", items });
      });
    }
    if (state.scope !== "ideologias") {
      (DATA.valueGroups || []).forEach((group) => {
        const items = buckets.get(group.id);
        if (items && items.length) {
          const meta = groupMeta(group.id);
          if (meta) groups.push({ meta, kind: "valor", items });
        }
      });
    }
    return groups;
  };

  const valuesPartHead = () =>
    el(
      "div",
      { class: "catalog-part-head" },
      el("span", { class: "eyebrow", text: "Valores" }),
      el("h2", { text: "Conceitos transversais" }),
      el("p", {
        text: "Definições que atravessam as famílias ideológicas e ajudam a comparar posições em temas específicos."
      })
    );

  const makeGroupSection = ({ meta, kind, items }) => {
    const sectionId = `catalog-group-${meta.id}`;
    const headingId = `${sectionId}-title`;
    const noun =
      kind === "valor"
        ? items.length === 1
          ? "conceito"
          : "conceitos"
        : items.length === 1
          ? "corrente"
          : "correntes";
    const section = el("section", {
      class: "catalog-group",
      id: sectionId,
      style: { "--c": meta.cor },
      "aria-labelledby": headingId
    });
    const heading = el(
      "header",
      { class: "catalog-group-head" },
      el(
        "div",
        { class: "catalog-group-title" },
        el("span", { class: "catalog-group-mark", "aria-hidden": "true" }),
        el(
          "div",
          {},
          el("h2", { id: headingId, text: meta.rotulo }),
          el("p", { text: meta.descricao })
        )
      ),
      el("span", { class: "catalog-group-count" }, el("b", { text: String(items.length) }), ` ${noun}`)
    );
    section.append(heading, el("ul", { class: "catalog-ideas-grid" }, ...items.map(makeIdeaCard)));
    return section;
  };

  const hasIdeaFilters = () =>
    Boolean(state.query || state.family || Object.keys(state.axes).length || state.intensity === "strong");

  const renderResultCount = () => {
    const node = document.getElementById("catalog-result-count");
    if (!node) return;
    const total = state.filteredIdeas.length;
    if (!total) {
      node.textContent = "Nenhum resultado encontrado.";
      return;
    }
    const values = state.filteredIdeas.filter((item) => itemKind(item) === "valor").length;
    const ideologies = total - values;
    const parts = [];
    if (ideologies) parts.push(`${ideologies} ${ideologies === 1 ? "ideologia" : "ideologias"}`);
    if (values) parts.push(`${values} ${values === 1 ? "valor" : "valores"}`);
    const prefix = hasIdeaFilters()
      ? `${total} ${total === 1 ? "resultado" : "resultados"}`
      : `${total} fichas`;
    node.textContent = `${prefix}: ${parts.join(" e ")}.`;
  };

  const renderMethodNote = () => {
    const note = document.getElementById("catalog-method-note");
    if (!note) return;
    const values = DATA.profiles.values || [];
    const partial = values.filter((item) => (item.knownAxes || []).length < 12).length;
    const show = state.scope !== "ideologias" && partial > 0;
    note.hidden = !show;
    if (show) {
      note.textContent = `${partial} dos ${values.length} valores têm posição definida em apenas parte dos 12 eixos. Onde não há posição, o cartão mostra um ponto neutro e a ficha indica "Sem posição definida".`;
    }
  };

  const renderSections = () => {
    const container = document.getElementById("catalog-sections");
    if (!container) return;
    if (!state.filteredIdeas.length) {
      const clear = el("button", {
        class: "atlas-button",
        type: "button",
        text: "Limpar filtros"
      });
      clear.addEventListener("click", clearIdeaFilters);
      container.replaceChildren(
        el(
          "div",
          { class: "catalog-empty" },
          icon("fa-magnifying-glass"),
          el("strong", { text: "Nenhum item encontrado" }),
          el("p", { text: "Tente outro termo, outro recorte ou remova um filtro." }),
          clear
        )
      );
      container.setAttribute("aria-busy", "false");
      renderResultCount();
      return;
    }
    const groups = groupFilteredIdeas();
    const nodes = [];
    let partAdded = false;
    groups.forEach((group) => {
      if (state.scope === "tudo" && group.kind === "valor" && !partAdded) {
        nodes.push(valuesPartHead());
        partAdded = true;
      }
      nodes.push(makeGroupSection(group));
    });
    container.replaceChildren(...nodes);
    container.setAttribute("aria-busy", "false");
    renderResultCount();
  };

  const matchesIdea = (item) => {
    const kind = itemKind(item);
    if (state.scope === "ideologias" && kind === "valor") return false;
    if (state.scope === "valores" && kind !== "valor") return false;
    if (state.family && familyIdForItem(item) !== state.family) return false;
    if (state.familyType && kind !== state.familyType) return false;
    if (state.query && !normalize(TABS.ideologias.searchText(item)).includes(state.query)) return false;
    const axes = Object.entries(state.axes);
    for (const [axisId, pole] of axes) {
      const value = axisValue(item, axisId);
      if (value == null) return false;
      if ((value >= 50 ? "a" : "b") !== pole) return false;
      if (state.intensity === "strong" && Math.max(value, 100 - value) < STRONG_THRESHOLD) return false;
    }
    return true;
  };

  const applyIdeaFilters = () => {
    state.filteredIdeas = TABS.ideologias.items.filter(matchesIdea);
    renderMethodNote();
    renderSections();
    renderActiveFilters();
    renderDrawerResult();
    updateFilterCount();
  };

  const renderActiveFilters = () => {
    const wrap = document.getElementById("catalog-active-filters");
    const pills = document.getElementById("catalog-active-pills");
    if (!wrap || !pills) return;
    const entries = [];
    const removeFamily = () => {
      clearFamilyState();
      syncCatalogUrl();
      refreshScopeControls();
      applyIdeaFilters();
    };
    if (state.query) {
      entries.push({
        label: `Busca: “${state.queryText || state.query}”`,
        color: "var(--primary)",
        onRemove: () => {
          state.query = "";
          state.queryText = "";
          const search = document.getElementById("catalog-search");
          if (search) search.value = "";
          applyIdeaFilters();
        }
      });
    }
    if (state.family) {
      const meta = familyMeta(state.family);
      entries.push({
        label: meta?.rotulo || state.family,
        color: meta?.cor || "var(--primary)",
        onRemove: removeFamily
      });
    }
    if (state.intensity === "strong") {
      entries.push({
        label: "Posição forte",
        color: "var(--primary)",
        onRemove: () => {
          state.intensity = "any";
          document.querySelectorAll('input[name="catalog-intensity"]').forEach((input) => {
            input.checked = input.value === "any";
          });
          applyIdeaFilters();
          syncDrawerState();
        }
      });
    }
    Object.entries(state.axes).forEach(([axisId, pole]) => {
      const axis = DATA.axes.find((entry) => entry.id === axisId);
      if (!axis) return;
      entries.push({
        label: `${axis.name}: ${poleName(axis, pole)}`,
        color: `var(--ax-${axisId}-${pole})`,
        onRemove: () => {
          delete state.axes[axisId];
          applyIdeaFilters();
          syncDrawerState();
        }
      });
    });
    wrap.hidden = entries.length === 0;
    pills.replaceChildren(
      ...entries.map((entry) => {
        const pill = el("span", { class: "catalog-active-pill", style: { "--c": entry.color } });
        const remove = el("button", {
          type: "button",
          "aria-label": `Remover filtro ${entry.label}`
        }, icon("fa-xmark"));
        remove.addEventListener("click", entry.onRemove);
        pill.append(document.createTextNode(entry.label), remove);
        return pill;
      })
    );
  };

  const renderDrawerResult = () => {
    const node = document.getElementById("catalog-drawer-result");
    if (!node) return;
    const count = state.filteredIdeas.length;
    node.replaceChildren(
      el("b", { text: String(count) }),
      document.createTextNode(count === 1 ? " resultado" : " resultados")
    );
  };

  const updateFilterCount = () => {
    const badge = document.getElementById("catalog-filter-count");
    if (!badge) return;
    const count = Object.keys(state.axes).length + (state.intensity === "strong" ? 1 : 0);
    badge.hidden = count === 0;
    badge.textContent = String(count);
  };

  const renderDrawer = () => {
    const grid = document.getElementById("catalog-axis-grid");
    if (!grid) return;
    grid.replaceChildren(
      ...DATA.axes.map((axis) => {
        const card = el("div", { class: "catalog-axis-card" });
        card.append(el("span", { class: "catalog-axis-title", text: axis.name }));
        const poles = el("div", { class: "catalog-axis-poles" });
        ["a", "b"].forEach((pole) => {
          const button = el("button", {
            class: "catalog-axis-pole",
            type: "button",
            "aria-pressed": String(state.axes[axis.id] === pole),
            "data-axis": axis.id,
            "data-pole": pole,
            "aria-label": `${axis.name}: ${poleName(axis, pole)}`
          });
          button.append(axisSvg(axis, pole, 14), el("span", { class: "catalog-axis-pole-name", text: poleName(axis, pole) }));
          button.addEventListener("click", () => toggleAxis(axis.id, pole));
          poles.append(button);
        });
        card.append(poles);
        return card;
      })
    );
    syncDrawerState();
  };

  const syncDrawerState = () => {
    document.querySelectorAll(".catalog-axis-pole").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(state.axes[button.dataset.axis] === button.dataset.pole)
      );
    });
    document.querySelectorAll('input[name="catalog-intensity"]').forEach((input) => {
      input.checked = input.value === state.intensity;
    });
    renderDrawerResult();
    updateFilterCount();
  };

  const toggleAxis = (axisId, pole) => {
    if (state.axes[axisId] === pole) delete state.axes[axisId];
    else state.axes[axisId] = pole;
    applyIdeaFilters();
    syncDrawerState();
  };

  const openDrawer = () => {
    const drawer = document.getElementById("catalog-filter-drawer");
    const toggle = document.getElementById("catalog-filter-toggle");
    if (!drawer) return;
    renderDrawer();
    drawer.hidden = false;
    toggle?.setAttribute("aria-expanded", "true");
    const offset = Number.parseFloat(getComputedStyle(main).getPropertyValue("--catalog-sticky-top")) || 0;
    const drawerTop = drawer.getBoundingClientRect().top + window.scrollY - offset - 8;
    if (drawerTop < window.scrollY || drawer.getBoundingClientRect().bottom > window.innerHeight) {
      window.scrollTo({ top: Math.max(0, drawerTop), behavior: "smooth" });
    }
    drawer.querySelector(".catalog-drawer-close")?.focus({ preventScroll: true });
  };

  const closeDrawer = () => {
    const drawer = document.getElementById("catalog-filter-drawer");
    const toggle = document.getElementById("catalog-filter-toggle");
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.focus({ preventScroll: true });
  };

  const clearIdeaFilters = () => {
    state.query = "";
    state.queryText = "";
    state.family = "";
    state.familyType = "";
    state.axes = {};
    state.intensity = "any";
    const search = document.getElementById("catalog-search");
    if (search) search.value = "";
    document.querySelectorAll('input[name="catalog-intensity"]').forEach((input) => {
      input.checked = input.value === "any";
    });
    refreshScopeControls();
    applyIdeaFilters();
    syncDrawerState();
  };

  const renderNotice = () => {
    const notice = document.getElementById("catalog-generic-notice");
    if (!notice) return;
    if (state.tab === "personalidades") {
      const hidden = DATA.profiles.figures.filter(isUnverifiedImage).length;
      if (hidden > 0) {
        notice.hidden = false;
        notice.textContent = `${hidden} retratos com licença não verificada não são exibidos. O crédito e a origem aparecem na ficha.`;
        return;
      }
    }
    notice.hidden = true;
    notice.textContent = "";
  };

  const renderSort = () => {
    const select = document.getElementById("catalog-generic-sort");
    if (!select) return;
    select.replaceChildren(
      ...[
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Nome (A–Z)" },
        { value: "za", label: "Nome (Z–A)" }
      ].map((sort) => el("option", { value: sort.value, text: sort.label }))
    );
    select.value = state.sort;
  };

  const renderFilters = () => {
    const container = document.getElementById("catalog-generic-filters");
    if (!container) return;
    container.replaceChildren();
    currentConfig().filters.forEach((filter) => {
      const group = el("div", { class: "atlas-filter-group" });
      group.append(el("span", { class: "atlas-filter-label", text: filter.label }));
      const chips = el("div", { class: "atlas-chips-row" });
      const options = [{ value: "", label: "Todas" }, ...filter.options.filter((option) => option.value)];
      options.forEach((option) => {
        const chip = el("button", {
          class: "atlas-chip catalog-filter",
          type: "button",
          "aria-pressed": String((state.filters[filter.key] || "") === option.value),
          "data-filter": filter.key,
          "data-value": option.value
        });
        chip.textContent = option.label;
        chip.addEventListener("click", () => {
          state.filters[filter.key] = option.value;
          group.querySelectorAll(".catalog-filter").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.value === option.value));
          });
          applyFilters(true);
        });
        chips.append(chip);
      });
      group.append(chips);
      container.append(group);
    });

    const clear = el("button", {
      class: "atlas-clear",
      type: "button",
      id: "catalog-generic-clear",
      hidden: true,
      text: "Limpar filtros"
    });
    clear.addEventListener("click", () => {
      state.query = "";
      state.queryText = "";
      state.filters = {};
      state.sort = "curadoria";
      const search = document.getElementById("catalog-generic-search");
      if (search) search.value = "";
      const sort = document.getElementById("catalog-generic-sort");
      if (sort) sort.value = "curadoria";
      renderFilters();
      applyFilters(true);
      search?.focus();
    });
    container.append(clear);
  };

  const sortItems = (items) => {
    const list = items.slice();
    if (state.sort === "az" || state.sort === "za") {
      list.sort((first, second) =>
        String(first.nome || "").localeCompare(String(second.nome || ""), "pt-BR", { sensitivity: "base" })
      );
      if (state.sort === "za") list.reverse();
    }
    return list;
  };

  const matches = (item) => {
    const config = currentConfig();
    if (state.query) {
      const haystack = normalize(config.searchText(item));
      if (!haystack.includes(state.query)) return false;
    }
    return config.filters.every((filter) => {
      const active = state.filters[filter.key];
      if (!active) return true;
      return normalize(filter.get(item)) === normalize(active);
    });
  };

  const makeTag = (text, color) => {
    const tag = el("span", { class: "atlas-tag atlas-tag-fam" });
    if (color) tag.style.setProperty("--fam", color);
    tag.textContent = text;
    return tag;
  };

  const buildFingerprint = (item) => {
    if (!Array.isArray(item.vetor) || item.vetor.length !== 12) return null;
    const wrap = el("div", {
      class: "atlas-fp",
      role: "img",
      "aria-label": `Impressão digital em doze eixos de ${item.nome}`
    });
    DATA.axes.forEach((axis, index) => {
      const value = Number(item.vetor[index]) || 0;
      const pole = value >= 50 ? axis.a : axis.b;
      const column = el("span", {
        class: "atlas-fp-col " + (value >= 50 ? "is-a" : "is-b"),
        title: `${axis.name}: ${Math.round(Math.max(value, 100 - value))}% ${pole}`
      });
      column.style.setProperty("--h", Math.max(1, (Math.abs(value - 50) / 50) * 14).toFixed(1) + "px");
      column.style.setProperty("--ca", `var(--ax-${axis.id}-a)`);
      column.style.setProperty("--cb", `var(--ax-${axis.id}-b)`);
      wrap.append(column);
    });
    return wrap;
  };

  const cardInitials = (item, config) =>
    el("span", {
      class: ["catalog-card-initials", config.markClass].filter(Boolean).join(" "),
      text: config.mark(item)
    });

  const buildCardMedia = (item, config) => {
    const media = mediaFor(item, state.tab);
    const unverified = isUnverifiedImage(item);
    const thumb = el("span", { class: "catalog-card-thumb" });
    const showImage = Boolean(media && media.path && !unverified);
    if (showImage) {
      thumb.classList.add(`is-${media.kind}`);
      const image = el("img", {
        src: media.path,
        alt: media.alt,
        loading: "lazy",
        decoding: "async"
      });
      if (item.imageNote) image.title = item.imageNote;
      image.addEventListener(
        "error",
        () => {
          image.remove();
          thumb.classList.add("is-empty");
          thumb.append(cardInitials(item, config));
        },
        { once: true }
      );
      thumb.append(image);
    } else {
      thumb.classList.add("is-empty");
      thumb.append(cardInitials(item, config));
    }
    return thumb;
  };

  const makeCard = (item, config, featured) => {
    const color = config.colorOf(item);
    const card = el("a", {
      class: "atlas-card catalog-card" + (featured ? " catalog-card-featured" : ""),
      href: "#" + encodeURIComponent(item.id),
      "aria-label": `Abrir ficha de ${item.nome}`
    });
    card.style.setProperty("--fam", color);
    if (featured) card.dataset.featured = "true";

    const meta = el("p", { class: "catalog-card-meta" });
    const kindLabel = typeof config.kindLabel === "function" ? config.kindLabel(item) : null;
    if (kindLabel) meta.append(el("span", { class: "catalog-card-kind", text: kindLabel }), " · ");
    const subtitle = config.subtitle(item);
    if (subtitle) meta.append(subtitle);
    const heading = el("div", { class: "catalog-card-heading" }, el("h3", { text: item.nome }), meta);
    card.append(el("div", { class: "catalog-card-top" }, buildCardMedia(item, config), heading));
    if (isUnverifiedImage(item)) {
      card.append(
        el(
          "span",
          { class: "catalog-card-placeholder" },
          icon("fa-eye-slash"),
          el("span", { class: "catalog-credit-warning", text: "Imagem não exibida: licença não verificada." })
        )
      );
    }
    card.append(el("p", { class: "atlas-card-summary catalog-card-summary", text: config.summary(item) }));

    const foot = el("div", { class: "catalog-card-foot" });
    const fingerprint = buildFingerprint(item);
    if (fingerprint) foot.append(fingerprint);
    const ctaLabel = typeof config.catalogCta === "function" ? config.catalogCta(item) : config.catalogCta;
    foot.append(el("span", { class: "catalog-card-cta" }, el("span", { text: ctaLabel }), icon("fa-arrow-right")));
    card.append(foot);

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openItem(item, state.tab);
    });
    return card;
  };

  const makeCountryCard = (item) => {
    const color = colorFor(item, "paises");
    const card = el("a", {
      class: "atlas-card catalog-card catalog-country-card",
      href: "#" + encodeURIComponent(item.id),
      "aria-label": `Abrir ficha de ${item.nome}`
    });
    card.style.setProperty("--fam", color);
    const media = mediaFor(item, "paises");
    const thumb = el("div", { class: "catalog-country-flag" });
    if (media?.path) {
      const image = el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" });
      image.addEventListener("error", () => { image.remove(); thumb.textContent = item.sigla || initials(item.nome); }, { once: true });
      thumb.append(image);
    } else {
      thumb.textContent = item.sigla || initials(item.nome);
    }
    const tags = el("div", { class: "catalog-country-tags" }, makeTag(item.tipo === "regime" ? "Regime histórico" : "País atual", color), item.periodo ? makeTag(item.periodo) : null);
    const foot = el("div", { class: "catalog-card-foot" }, buildFingerprint(item), el("span", { class: "catalog-card-cta" }, el("span", { text: "Ver perfil" }), icon("fa-arrow-right")));
    card.append(thumb, tags, el("h3", { text: item.nome }), el("p", { class: "atlas-card-summary catalog-card-summary", text: item.summary || item.resumo || item.description }), foot);
    card.addEventListener("click", (event) => { event.preventDefault(); openItem(item, "paises"); });
    return card;
  };

  const makePersonalityCard = (item) => {
    const color = colorFor(item, "personalidades");
    const card = el("a", {
      class: "atlas-card catalog-card catalog-personality-card",
      href: "#" + encodeURIComponent(item.id),
      "aria-label": `Abrir ficha de ${item.nome}`
    });
    card.style.setProperty("--fam", color);
    const media = mediaFor(item, "personalidades");
    const portrait = el("div", { class: "catalog-personality-portrait" });
    if (media?.path && !isUnverifiedImage(item)) {
      const image = el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" });
      image.addEventListener("error", () => { image.remove(); portrait.textContent = initials(item.nome); }, { once: true });
      portrait.append(image);
    } else {
      portrait.append(el("span", { text: initials(item.nome) }));
    }
    const tags = el("div", { class: "catalog-country-tags" }, makeTag(item.areaLabel || areaOf(item)?.rotulo || "Personalidade", color), item.periodo ? makeTag(item.periodo) : null);
    const foot = el("div", { class: "catalog-card-foot" }, buildFingerprint(item), el("span", { class: "catalog-card-cta" }, el("span", { text: "Ver perfil" }), icon("fa-arrow-right")));
    card.append(portrait, tags, el("h3", { text: item.nome }), el("p", { class: "atlas-card-summary catalog-card-summary", text: item.summary || item.resumo || item.description }), foot);
    card.addEventListener("click", (event) => { event.preventDefault(); openItem(item, "personalidades"); });
    return card;
  };

  const makePartyCard = (item) => {
    const color = colorFor(item, "partidos");
    const card = el("a", {
      class: "atlas-card catalog-card catalog-party-card",
      href: "#" + encodeURIComponent(item.id),
      "aria-label": `Abrir ficha de ${item.nome}`
    });
    card.style.setProperty("--fam", color);
    const media = mediaFor(item, "partidos");
    const logo = el("div", { class: "catalog-party-logo" });
    if (media?.path && !isUnverifiedImage(item)) {
      const image = el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" });
      image.addEventListener("error", () => { image.remove(); logo.textContent = item.sigla || initials(item.nome); }, { once: true });
      logo.append(image);
    } else {
      logo.textContent = item.sigla || initials(item.nome);
    }
    const tags = el("div", { class: "catalog-country-tags" }, makeTag(item.category || "Partido", color), item.historico ? makeTag("Histórico") : makeTag("Atual"), item.periodo ? makeTag(item.periodo) : null);
    const foot = el("div", { class: "catalog-card-foot" }, buildFingerprint(item), el("span", { class: "catalog-card-cta" }, el("span", { text: "Ver perfil" }), icon("fa-arrow-right")));
    card.append(logo, tags, el("h3", { text: item.nome }), el("p", { class: "atlas-card-summary catalog-card-summary", text: item.summary || item.resumo || item.description }), foot);
    card.addEventListener("click", (event) => { event.preventDefault(); openItem(item, "partidos"); });
    return card;
  };

  const renderFeatured = () => {
    const section = document.getElementById("catalog-featured");
    const grid = document.getElementById("catalog-featured-grid");
    if (!section || !grid) return;
    if (state.tab === "ideologias" || state.tab === "paises" || state.tab === "personalidades") {
      section.hidden = true;
      return;
    }
    const config = currentConfig();
    const items = (config.featured || [])
      .map((id) => MAPS.byTab[state.tab].get(id))
      .filter(Boolean);
    if (!items.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    grid.replaceChildren(...items.map((item) => makeCard(item, config, true)));
    const label = section.querySelector("[data-catalog-featured-label]");
    if (label) label.textContent = config.featuredLabel || `Seleção editorial de ${config.plural}`;
    const note = section.querySelector("[data-catalog-featured-note]");
    if (note) note.textContent = items.length > 3 ? "Seis recortes para começar." : "Três recortes para começar.";
  };

  const renderGrid = () => {
    const config = currentConfig();
    const grid = document.getElementById("catalog-generic-grid");
    if (!grid) return;
    const shown = state.filtered.slice(0, state.visible);
    grid.replaceChildren(...shown.map((item) => state.tab === "paises" ? makeCountryCard(item) : state.tab === "personalidades" ? makePersonalityCard(item) : state.tab === "partidos" ? makePartyCard(item) : makeCard(item, config, false)));
    if (shown.length === 0) {
      grid.append(
        el(
          "div",
          { class: "atlas-empty" },
          icon("fa-magnifying-glass"),
          el("strong", { text: "Nenhum item encontrado" }),
          el("p", { text: "Tente outro termo ou remova um dos filtros." })
        )
      );
    }
    const count = document.getElementById("catalog-generic-count");
    if (count) {
      count.textContent = state.filtered.length
        ? `Exibindo ${shown.length} de ${state.filtered.length} ${config.plural}.`
        : "Nenhum resultado encontrado.";
    }
    const loadMore = document.getElementById("catalog-generic-load-more");
    if (loadMore) {
      loadMore.hidden = shown.length >= state.filtered.length;
      loadMore.textContent = "Carregar mais perfis";
    }
    const clear = document.getElementById("catalog-generic-clear");
    if (clear) {
      clear.hidden = !state.query && !Object.values(state.filters).some(Boolean);
    }
  };

  const applyFilters = (reset) => {
    if (reset) state.visible = PAGE_SIZE;
    state.filtered = sortItems(currentConfig().items.filter(matches));
    renderNotice();
    renderGrid();
  };

  const addSection = (body, title, iconName, content) => {
    if (!content) return;
    const section = el("section", { class: "atlas-dialog-section" });
    section.append(el("h3", {}, icon(iconName), el("span", { text: title })));
    section.append(content);
    body.append(section);
  };

  const bulletList = (items) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return el("ul", { class: "atlas-dialog-list" }, items.filter(Boolean).map((item) => el("li", { text: item })));
  };

  const buildAxes = (item) => {
    if (!Array.isArray(item.vetor) || item.vetor.length !== 12) return null;
    const list = el("ul", { class: "atlas-axis-list" });
    DATA.axes.forEach((axis, index) => {
      if (!isAxisKnown(item, axis.id)) {
        const unknown = el("li", { class: "atlas-axis-row is-unknown" });
        unknown.append(
          el(
            "div",
            { class: "atlas-axis-row-head" },
            el("span", { text: axis.name }),
            el("strong", { text: "Sem posição definida" })
          ),
          el("div", { class: "atlas-axis-track is-empty" }),
          el(
            "div",
            { class: "atlas-axis-poles-row" },
            el("span", { text: axis.a }),
            el("span", { text: axis.b })
          )
        );
        list.append(unknown);
        return;
      }
      const value = Math.max(0, Math.min(100, Number(item.vetor[index]) || 0));
      const pole = value >= 50 ? axis.a : axis.b;
      const row = el("li", { class: "atlas-axis-row" });
      row.style.setProperty("--ca", `var(--ax-${axis.id}-a)`);
      row.style.setProperty("--cb", `var(--ax-${axis.id}-b)`);
      row.style.setProperty("--marker", `var(--ax-${axis.id}-${value >= 50 ? "a" : "b"})`);
      row.append(
        el(
          "div",
          { class: "atlas-axis-row-head" },
          el("span", { text: axis.name }),
          el("strong", { text: `${Math.round(Math.max(value, 100 - value))}% ${pole}` })
        ),
        el("div", { class: "atlas-axis-track" }, el("span", { class: "atlas-axis-marker" }))
      );
      row.querySelector(".atlas-axis-marker").style.setProperty("--p", String(100 - value));
      row.append(
        el("div", { class: "atlas-axis-poles-row" }, el("span", { text: axis.a }), el("span", { text: axis.b }))
      );
      list.append(row);
    });
    return list;
  };

  const relatedChip = (tab, id, iconName) => {
    const target = MAPS.byTab[tab]?.get(id);
    if (!target) return null;
    const link = el("a", { href: buildUrl(tab, id, "tudo") }, iconName ? icon(iconName) : null, el("span", { text: target.nome }));
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openItem(target, tab);
    });
    return link;
  };

  const chipsFor = (tab, ids, iconName) => {
    if (!Array.isArray(ids) || ids.length === 0) return null;
    const wrap = el("div", { class: "atlas-related" });
    [...new Set(ids)].forEach((id) => {
      const chip = relatedChip(tab, id, iconName);
      if (chip) wrap.append(chip);
    });
    return wrap.childElementCount ? wrap : null;
  };

  const unique = (values) => [...new Set((values || []).filter(Boolean))];

  const creditNode = (item) => {
    const isLogo = Boolean(item.logoPath);
    const credit = isLogo ? item.logoSourceName : item.imageCredit;
    const url = isLogo ? item.logoSourceUrl : item.imageSourceUrl;
    const note = isLogo ? item.logoNote : item.imageNote;
    if (!credit && !url && !note && !isUnverifiedImage(item)) return null;
    const list = el("ul", { class: "atlas-dialog-list" });
    if (credit) {
      const line = el("li", {}, `Imagem: ${credit}`);
      if (url) {
        line.append(
          document.createTextNode(" · "),
          el("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: "ver origem" })
        );
      }
      list.append(line);
    } else if (url) {
      list.append(el("li", {}, el("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: "Ver origem da imagem" })));
    }
    if (note) list.append(el("li", { text: note }));
    if (isUnverifiedImage(item)) {
      list.append(
        el("li", {
          text: "O retrato não é exibido no catálogo porque a licença ainda não foi verificada."
        })
      );
    }
    return list;
  };

  const sourceNode = (item) => {
    const list = el("ul", { class: "atlas-dialog-list" });
    list.append(el("li", { text: `Vetor: ${vectorSourceLabel(item)}.` }));
    if (item.source) {
      list.append(
        el(
          "li",
          {},
          "Fonte e contexto: ",
          el("a", {
            href: item.source,
            target: "_blank",
            rel: "noopener noreferrer",
            text: "12 Axes"
          })
        )
      );
    }
    if (item.vectorSource === "atlas") {
      list.append(el("li", { text: "Perfil curado pelo atlas político do King's Newsletter." }));
    } else {
      list.append(
        el("li", {
          text: "Perfil do 12 Axes convertido para a régua do atlas: 100 corresponde ao primeiro polo local."
        })
      );
    }
    return list;
  };

  const buildNearby = (item) => {
    const isValue = itemKind(item) === "valor";
    const items = MAPS.byTab[state.tab];
    const matchesList = [...items.values()]
      .filter(
        (entry) =>
          entry.id !== item.id &&
          Array.isArray(entry.vetor) &&
          (itemKind(entry) === "valor") === isValue
      )
      .map((entry) => ({ item: entry, score: matchScore(item.vetor, entry.vetor) }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 4);
    if (!matchesList.length) return null;
    const wrap = el("div", { class: "atlas-nearby" });
    matchesList.forEach(({ item: entry, score }) => {
      const link = el("a", { class: "atlas-nearby-item", href: buildUrl(state.tab, entry.id, state.scope) });
      link.append(
        el("span", { class: "atlas-nearby-name", text: entry.nome }),
        el("span", { class: "atlas-nearby-score", text: `${score}%` })
      );
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openItem(entry, state.tab);
      });
      wrap.append(link);
    });
    return wrap;
  };

  const dialogMedia = (item, config) => {
    const media = mediaFor(item, state.tab);
    if (!media || !media.path || isUnverifiedImage(item)) {
      return el("div", { class: "catalog-dialog-media is-empty" }, el("span", { text: config.mark(item) }));
    }
    return el(
      "div",
      { class: `catalog-dialog-media is-${media.kind}` },
      el("img", { src: media.path, alt: media.alt, loading: "eager", decoding: "async" })
    );
  };

  const profilePole = (axis, value, side) => {
    const pole = side === "left" ? "a" : "b";
    const percentage = side === "left" ? value : 100 - value;
    const active = percentage >= 50;
    const node = el("div", {
      class: `catalog-profile-pole ${side}${active ? " is-active" : ""}`
    });
    const label = el(
      "span",
      {},
      el("b", { text: poleName(axis, pole) }),
      el("em", { text: `${Math.round(percentage)}%` })
    );
    if (side === "left") node.append(axisSvg(axis, pole, 18), label);
    else node.append(label, axisSvg(axis, pole, 18));
    return node;
  };

  const profileAxisRow = (item, axis) => {
    const value = axisValue(item, axis.id);
    const row = el("li", { class: "catalog-profile-axis atlas-axis-row" });
    if (value == null) {
      row.append(
        el(
          "div",
          { class: "catalog-profile-axis-head" },
          el("h3", { text: axis.name }),
          el("span", { class: "catalog-profile-axis-status", text: "Sem posição definida" })
        ),
        el("div", { class: "catalog-profile-axis-unknown", text: "Este eixo não foi avaliado para este conceito." })
      );
      return row;
    }
    const strength = Math.max(value, 100 - value);
    const direction = value >= 50 ? axis.a : axis.b;
    const level = strength >= 75 ? "Muito forte" : strength >= 60 ? "Forte" : strength > 50 ? "Inclinado" : "Equilibrado";
    row.style.setProperty("--axis-color", `var(--ax-${axis.id}-${value >= 50 ? "a" : "b"})`);
    row.append(
      el(
        "div",
        { class: "catalog-profile-axis-head" },
        el("h3", { text: axis.name }),
        el("span", { class: "catalog-profile-axis-status" }, el("i", { class: "catalog-profile-axis-dot" }), `${level} · ${direction}`)
      ),
      el(
        "div",
        { class: "catalog-profile-axis-bar", role: "img", "aria-label": `${axis.name}: ${axis.a} ${Math.round(value)}%, ${axis.b} ${Math.round(100 - value)}%` },
        profilePole(axis, value, "left"),
        el("div", { class: "catalog-profile-track" }, el("span", { class: "catalog-profile-marker", style: { left: `${value}%` } })),
        profilePole(axis, value, "right")
      )
    );
    return row;
  };

  const profileReference = (item, tab, label) => {
    if (!item) return null;
    const media = mediaFor(item, tab);
    const image = media && media.path && !isUnverifiedImage(item)
      ? el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" })
      : el("span", { class: "catalog-profile-ref-initials", text: initials(item.nome) });
    const link = el("a", { class: "catalog-profile-reference", href: buildUrl(tab, item.id, "tudo") });
    link.append(
      image,
      el(
        "span",
        {},
        el("small", { text: label }),
        el("b", { text: item.nome }),
        el("em", { text: [item.papel || item.role || item.periodo, item.regiao].filter(Boolean).join(" · ") })
      )
    );
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openItem(item, tab);
    });
    return link;
  };

  const buildProfileView = (item) => {
    const config = TABS.ideologias;
    const color = config.colorOf(item);
    const family = familyOf(item);
    const figures = referenceFiguresFor(item);
    const places = referencePlacesFor(item);
    const shell = el("div", { class: "catalog-profile-shell", style: { "--profile-color": color } });
    const close = el("button", { class: "atlas-dialog-close catalog-profile-close", type: "button", "aria-label": "Fechar ficha" }, icon("fa-xmark"));
    close.addEventListener("click", () => closeDialog());
    const back = el("button", { class: "catalog-profile-back", type: "button" }, icon("fa-arrow-left"), el("span", { text: "Voltar ao catálogo" }));
    back.addEventListener("click", () => closeDialog());
    const hero = el(
      "section",
      { class: "catalog-profile-hero" },
      el(
        "div",
        { class: "catalog-profile-hero-copy" },
        el("div", { class: "catalog-profile-tags" }, makeTag(family?.rotulo || item.categoria, color), makeTag("Ideologia")),
        el("h1", { id: "catalog-dialog-title", text: item.nome }),
        el("p", { class: "catalog-profile-lead", text: item.descriptionText || item.longDescription || item.description || item.resumo }),
        compareProfileAction(item)
      ),
      el(
        "aside",
        { class: "catalog-profile-references" },
        profileReference(figures[0], "personalidades", "Personalidade de referência"),
        profileReference(places[0], "paises", "País de referência")
      )
    );
    const phrase = item.phrase
      ? el("figure", { class: "catalog-profile-phrase" }, el("span", { class: "catalog-profile-quote", text: "“" }), el("div", {}, el("span", { class: "eyebrow", text: "Em uma frase" }), el("blockquote", { text: item.phrase }), el("figcaption", {}, "É assim que alguém do ", el("b", { text: item.nome }), " resumiria a sociedade que quer.")))
      : null;
    const tabs = el("div", { class: "catalog-profile-tabs", role: "tablist", "aria-label": "Seções da ideologia" });
    ["Eixos", "Personalidades", "Países", "Ideologias"].forEach((label, index) => {
      const tab = el("button", { type: "button", role: "tab", "aria-selected": String(index === 0), text: label });
      tab.addEventListener("click", () => {
        tabs.querySelectorAll("button").forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
        const panelId = normalize(label);
        shell.querySelectorAll(".catalog-profile-tab-panel").forEach((panel) => { panel.hidden = panel.dataset.panel !== panelId; });
      });
      tabs.append(tab);
    });
    const axesPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "eixos" }, el("span", { class: "eyebrow", text: "Eixos políticos" }), el("h2", { text: "Perfil nos 12 eixos" }), el("ul", { class: "catalog-profile-axis-list" }, DATA.axes.map((axis) => profileAxisRow(item, axis))));
    const figureIds = figures.map((figure) => figure.id);
    const placeIds = places.map((place) => place.id);
    const peoplePanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "personalidades", hidden: true }, el("h2", { text: "Personalidades" }), chipsFor("personalidades", figureIds, "fa-user") || el("p", { class: "catalog-profile-muted", text: "Nenhuma personalidade de referência foi encontrada." }));
    const placesPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "paises", hidden: true }, el("h2", { text: "Países" }), chipsFor("paises", placeIds, "fa-flag") || el("p", { class: "catalog-profile-muted", text: "Nenhum país de referência foi encontrado." }));
    const ideologyPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "ideologias", hidden: true }, el("h2", { text: "Ideologias relacionadas" }), buildNearby(item) || el("p", { class: "catalog-profile-muted", text: "Nenhuma ideologia próxima disponível." }));
    const distinctions = el("section", { class: "catalog-profile-distinction" }, el("h2", { text: "O que distingue esta ideologia" }), el("div", { class: "catalog-profile-distinction-grid" }, el("article", {}, el("span", { class: "catalog-profile-badge", text: "Posições mais fortes" }), el("h3", { text: DATA.axes.slice().sort((a, b) => (Math.max(...[axisValue(item, b.id) || 50, 100 - (axisValue(item, b.id) || 50)]) - 50) - (Math.max(...[axisValue(item, a.id) || 50, 100 - (axisValue(item, a.id) || 50)]) - 50))[0]?.name || "Perfil" }), el("p", { text: "Os eixos mais distantes do centro mostram onde esta corrente assume posições mais definidas." })), el("article", {}, el("span", { class: "catalog-profile-badge is-neutral", text: "Leitura do perfil" }), el("h3", { text: family?.rotulo || "Ideologia" }), el("p", { text: item.ideia || item.resumo || "Uma síntese editorial do perfil político." }))));
    const cta = el("section", { class: "catalog-profile-cta" }, el("div", {}, el("span", { class: "eyebrow", text: "Teste político" }), el("h2", { text: "E você, onde está no espectro?" }), el("p", { text: `Responda ao quiz e veja sua compatibilidade com ${item.nome} e outras ideologias nos 12 eixos.` })), el("a", { class: "atlas-button", href: "/teste-politico" }, el("span", { text: "Fazer o teste" }), icon("fa-arrow-right")));
    shell.append(back, el("div", { class: "catalog-profile-content" }, hero, phrase, tabs, axesPanel, peoplePanel, placesPanel, ideologyPanel, distinctions, cta), close);
    return shell;
  };

  const buildCountryProfileView = (item) => {
    const config = TABS.paises;
    const color = config.colorOf(item);
    const relatedIdeologies = (item.ideologias || []).map((id) => MAPS.ideologies.get(id)).filter(Boolean);
    const nearestIdeologies = relatedIdeologies.length ? relatedIdeologies : nearestByVector(item, DATA.profiles.ideologies).slice(0, 3);
    const nearestFigures = nearestByVector(item, MAPS.figureList).slice(0, 1);
    const nearbyCountries = nearestByVector(item, MAPS.placeList.filter((entry) => entry.id !== item.id)).slice(0, 6);
    const shell = el("div", { class: "catalog-profile-shell", style: { "--profile-color": color } });
    const close = el("button", { class: "atlas-dialog-close catalog-profile-close", type: "button", "aria-label": "Fechar ficha" }, icon("fa-xmark"));
    close.addEventListener("click", () => closeDialog());
    const back = el("button", { class: "catalog-profile-back", type: "button" }, icon("fa-arrow-left"), el("span", { text: "Voltar ao catálogo" }));
    back.addEventListener("click", () => closeDialog());
    const media = mediaFor(item, "paises");
    const image = media?.path ? el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" }) : el("span", { class: "catalog-profile-ref-initials", text: item.sigla || initials(item.nome) });
    const hero = el("section", { class: "catalog-profile-hero catalog-country-profile-hero" },
      el("div", { class: "catalog-profile-hero-copy" },
        el("div", { class: "catalog-profile-tags" }, makeTag(item.tipo === "regime" ? "Regime histórico" : "País atual", color), item.periodo ? makeTag(item.periodo) : null),
        el("h1", { id: "catalog-dialog-title", text: item.nome }),
        el("p", { class: "catalog-profile-lead", text: item.description || item.longDescription || item.resumo }),
        el("div", { class: "catalog-country-kpis" }, el("span", {}, el("b", { text: item.regiao || "—" }), el("small", { text: "região" })), el("span", {}, el("b", { text: item.categoria || "—" }), el("small", { text: "configuração" }))),
        compareProfileAction(item)
      ),
      el("aside", { class: "catalog-country-profile-media" }, image)
    );
    const tabs = el("div", { class: "catalog-profile-tabs", role: "tablist", "aria-label": "Seções do país ou regime" });
    ["Eixos", "Ideologias", "Personalidades", "Países"].forEach((label, index) => {
      const tab = el("button", { type: "button", role: "tab", "aria-selected": String(index === 0), text: label });
      tab.addEventListener("click", () => {
        const panelId = normalize(label);
        tabs.querySelectorAll("button").forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
        shell.querySelectorAll(".catalog-profile-tab-panel").forEach((panel) => { panel.hidden = panel.dataset.panel !== panelId; });
      });
      tabs.append(tab);
    });
    const axesPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "eixos" }, el("span", { class: "eyebrow", text: "Eixos políticos" }), el("h2", { text: "Perfil nos 12 eixos" }), el("ul", { class: "catalog-profile-axis-list" }, DATA.axes.map((axis) => profileAxisRow(item, axis))));
    const ideologyPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "ideologias", hidden: true }, el("h2", { text: "Proximidade ideológica" }), chipsFor("ideologias", nearestIdeologies.map((entry) => entry.id), "fa-scale-balanced") || el("p", { class: "catalog-profile-muted", text: "Nenhuma ideologia relacionada foi encontrada." }));
    const peoplePanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "personalidades", hidden: true }, el("h2", { text: "Personalidade mais próxima" }), chipsFor("personalidades", nearestFigures.map((entry) => entry.id), "fa-user") || el("p", { class: "catalog-profile-muted", text: "Nenhuma personalidade próxima foi encontrada." }));
    const countryPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "paises", hidden: true }, el("h2", { text: item.tipo === "regime" ? "Regimes e países parecidos" : "Países parecidos" }), chipsFor("paises", nearbyCountries.map((entry) => entry.id), "fa-flag") || el("p", { class: "catalog-profile-muted", text: "Nenhum perfil parecido foi encontrado." }));
    const distinction = el("section", { class: "catalog-profile-distinction" }, el("h2", { text: `O que distingue ${item.nome}` }), el("div", { class: "catalog-profile-distinction-grid" }, el("article", {}, el("span", { class: "catalog-profile-badge", text: "Configuração política" }), el("h3", { text: item.categoria || item.tipo }), el("p", { text: item.resumo || item.description })), el("article", {}, el("span", { class: "catalog-profile-badge is-neutral", text: "Leitura territorial" }), el("h3", { text: item.regiao || "Perfil nacional" }), el("p", { text: item.periodo || "Perfil contemporâneo" }))));
    const cta = el("section", { class: "catalog-profile-cta" }, el("div", {}, el("span", { class: "eyebrow", text: "Teste político" }), el("h2", { text: "Você viveria bem aqui?" }), el("p", { text: `Responda ao quiz e veja sua compatibilidade com ${item.nome} e outros países e regimes.` })), el("a", { class: "atlas-button", href: "/teste-politico" }, el("span", { text: "Fazer o teste" }), icon("fa-arrow-right")));
    shell.append(back, el("div", { class: "catalog-profile-content" }, hero, tabs, axesPanel, ideologyPanel, peoplePanel, countryPanel, distinction, cta), close);
    return shell;
  };

  const buildPersonalityProfileView = (item) => {
    const config = TABS.personalidades;
    const color = config.colorOf(item);
    const ideology = item.ideologia ? MAPS.ideologies.get(item.ideologia) : null;
    const ideologies = ideology ? [ideology] : nearestByVector(item, DATA.profiles.ideologies).slice(0, 3);
    const countries = nearestByVector(item, MAPS.placeList).slice(0, 1);
    const people = nearestByVector(item, MAPS.figureList.filter((entry) => entry.id !== item.id)).slice(0, 6);
    const shell = el("div", { class: "catalog-profile-shell", style: { "--profile-color": color } });
    const close = el("button", { class: "atlas-dialog-close catalog-profile-close", type: "button", "aria-label": "Fechar ficha" }, icon("fa-xmark"));
    close.addEventListener("click", () => closeDialog());
    const back = el("button", { class: "catalog-profile-back", type: "button" }, icon("fa-arrow-left"), el("span", { text: "Voltar ao catálogo" }));
    back.addEventListener("click", () => closeDialog());
    const media = mediaFor(item, "personalidades");
    const portrait = media?.path && !isUnverifiedImage(item) ? el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" }) : el("span", { class: "catalog-profile-ref-initials", text: initials(item.nome) });
    const hero = el("section", { class: "catalog-profile-hero catalog-personality-profile-hero" },
      el("div", { class: "catalog-profile-hero-copy" },
        el("div", { class: "catalog-profile-tags" }, makeTag(item.areaLabel || areaOf(item)?.rotulo || "Personalidade", color), item.periodo ? makeTag(item.periodo) : null),
        el("h1", { id: "catalog-dialog-title", text: item.nome }),
        el("p", { class: "catalog-profile-lead", text: item.description || item.longDescription || item.resumo }),
        el("div", { class: "catalog-country-kpis" }, el("span", {}, el("b", { text: item.papel || item.role || "—" }), el("small", { text: "papel" })), el("span", {}, el("b", { text: item.periodo || "—" }), el("small", { text: "período" }))),
        compareProfileAction(item)
      ),
      el("aside", { class: "catalog-personality-profile-media" }, portrait)
    );
    const tabs = el("div", { class: "catalog-profile-tabs", role: "tablist", "aria-label": "Seções da personalidade" });
    ["Eixos", "Ideologias", "Personalidades", "Países"].forEach((label, index) => {
      const tab = el("button", { type: "button", role: "tab", "aria-selected": String(index === 0), text: label });
      tab.addEventListener("click", () => {
        const panelId = normalize(label);
        tabs.querySelectorAll("button").forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
        shell.querySelectorAll(".catalog-profile-tab-panel").forEach((panel) => { panel.hidden = panel.dataset.panel !== panelId; });
      });
      tabs.append(tab);
    });
    const axesPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "eixos" }, el("span", { class: "eyebrow", text: "Eixos políticos" }), el("h2", { text: "Perfil nos 12 eixos" }), el("ul", { class: "catalog-profile-axis-list" }, DATA.axes.map((axis) => profileAxisRow(item, axis))));
    const ideologyPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "ideologias", hidden: true }, el("h2", { text: "Ideologias mais próximas" }), chipsFor("ideologias", ideologies.map((entry) => entry.id), "fa-scale-balanced") || el("p", { class: "catalog-profile-muted", text: "Nenhuma ideologia próxima foi encontrada." }));
    const peoplePanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "personalidades", hidden: true }, el("h2", { text: "Personalidades mais próximas" }), chipsFor("personalidades", people.map((entry) => entry.id), "fa-user") || el("p", { class: "catalog-profile-muted", text: "Nenhuma personalidade próxima foi encontrada." }));
    const countryPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "paises", hidden: true }, el("h2", { text: "País mais próximo" }), chipsFor("paises", countries.map((entry) => entry.id), "fa-flag") || el("p", { class: "catalog-profile-muted", text: "Nenhum país próximo foi encontrado." }));
    const distinction = el("section", { class: "catalog-profile-distinction" }, el("h2", { text: `O que distingue ${item.nome}` }), el("div", { class: "catalog-profile-distinction-grid" }, el("article", {}, el("span", { class: "catalog-profile-badge", text: "Área de atuação" }), el("h3", { text: item.areaLabel || areaOf(item)?.rotulo || "Política" }), el("p", { text: item.resumo || item.description })), el("article", {}, el("span", { class: "catalog-profile-badge is-neutral", text: "Vetor" }), el("h3", { text: vectorSourceLabel(item) }), el("p", { text: "Uma leitura editorial aproximada da posição desta personalidade nos 12 eixos." }))));
    const cta = el("section", { class: "catalog-profile-cta" }, el("div", {}, el("span", { class: "eyebrow", text: "Teste político" }), el("h2", { text: "E você, com quem se parece?" }), el("p", { text: `Responda ao quiz e veja sua compatibilidade com ${item.nome}, ideologias e países nos 12 eixos.` })), el("a", { class: "atlas-button", href: "/teste-politico" }, el("span", { text: "Fazer o teste" }), icon("fa-arrow-right")));
    shell.append(back, el("div", { class: "catalog-profile-content" }, hero, tabs, axesPanel, ideologyPanel, peoplePanel, countryPanel, distinction, cta), close);
    return shell;
  };

  const buildPartyProfileView = (item) => {
    const config = TABS.partidos;
    const color = config.colorOf(item);
    const ideology = item.ideologia ? MAPS.ideologies.get(item.ideologia) : null;
    const ideologies = ideology ? [ideology, ...nearestByVector(item, DATA.profiles.ideologies).filter((entry) => entry.id !== ideology.id)] : nearestByVector(item, DATA.profiles.ideologies);
    const people = nearestByVector(item, MAPS.figureList).slice(0, 6);
    const parties = nearestByVector(item, MAPS.partyList.filter((entry) => entry.id !== item.id)).slice(0, 6);
    const shell = el("div", { class: "catalog-profile-shell", style: { "--profile-color": color } });
    const close = el("button", { class: "atlas-dialog-close catalog-profile-close", type: "button", "aria-label": "Fechar ficha" }, icon("fa-xmark"));
    close.addEventListener("click", () => closeDialog());
    const back = el("button", { class: "catalog-profile-back", type: "button" }, icon("fa-arrow-left"), el("span", { text: "Voltar ao catálogo" }));
    back.addEventListener("click", () => closeDialog());
    const media = mediaFor(item, "partidos");
    const logo = media?.path && !isUnverifiedImage(item) ? el("img", { src: media.path, alt: media.alt, loading: "lazy", decoding: "async" }) : el("span", { class: "catalog-profile-ref-initials", text: item.sigla || initials(item.nome) });
    const hero = el("section", { class: "catalog-profile-hero catalog-party-profile-hero" },
      el("div", { class: "catalog-profile-hero-copy" },
        el("div", { class: "catalog-profile-tags" }, makeTag(item.category || "Partido", color), makeTag(item.historico ? "Histórico" : "Atual"), item.periodo ? makeTag(item.periodo) : null),
        el("h1", { id: "catalog-dialog-title", text: item.nome }),
        el("p", { class: "catalog-profile-lead", text: item.description || item.longDescription || item.resumo }),
        el("div", { class: "catalog-country-kpis" }, el("span", {}, el("b", { text: placeName(item.paisId) || "—" }), el("small", { text: "país" })), el("span", {}, el("b", { text: item.orientacao || "—" }), el("small", { text: "orientação" }))),
        compareProfileAction(item)
      ),
      el("aside", { class: "catalog-party-profile-media" }, logo)
    );
    const tabs = el("div", { class: "catalog-profile-tabs", role: "tablist", "aria-label": "Seções do partido ou organização" });
    ["Eixos", "Ideologias", "Personalidades", "Partidos"].forEach((label, index) => {
      const tab = el("button", { type: "button", role: "tab", "aria-selected": String(index === 0), text: label });
      tab.addEventListener("click", () => {
        const panelId = normalize(label);
        tabs.querySelectorAll("button").forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
        shell.querySelectorAll(".catalog-profile-tab-panel").forEach((panel) => { panel.hidden = panel.dataset.panel !== panelId; });
      });
      tabs.append(tab);
    });
    const axesPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "eixos" }, el("span", { class: "eyebrow", text: "Eixos políticos" }), el("h2", { text: "Perfil nos 12 eixos" }), el("ul", { class: "catalog-profile-axis-list" }, DATA.axes.map((axis) => profileAxisRow(item, axis))));
    const ideologyPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "ideologias", hidden: true }, el("h2", { text: "Ideologias mais próximas" }), chipsFor("ideologias", ideologies.slice(0, 3).map((entry) => entry.id), "fa-scale-balanced") || el("p", { class: "catalog-profile-muted", text: "Nenhuma ideologia próxima foi encontrada." }));
    const peoplePanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "personalidades", hidden: true }, el("h2", { text: "Personalidades mais próximas" }), chipsFor("personalidades", people.map((entry) => entry.id), "fa-user") || el("p", { class: "catalog-profile-muted", text: "Nenhuma personalidade próxima foi encontrada." }));
    const partyPanel = el("section", { class: "catalog-profile-tab-panel", "data-panel": "partidos", hidden: true }, el("h2", { text: "Partidos e organizações parecidos" }), chipsFor("partidos", parties.map((entry) => entry.id), "fa-flag") || el("p", { class: "catalog-profile-muted", text: "Nenhum perfil parecido foi encontrado." }));
    const distinction = el("section", { class: "catalog-profile-distinction" }, el("h2", { text: `O que distingue ${item.nome}` }), el("div", { class: "catalog-profile-distinction-grid" }, el("article", {}, el("span", { class: "catalog-profile-badge", text: "Trajetória" }), el("h3", { text: item.orientacao || item.category || "Organização política" }), el("p", { text: (item.marcos || []).join(" ") || item.resumo || item.description })), el("article", {}, el("span", { class: "catalog-profile-badge is-neutral", text: "Vetor" }), el("h3", { text: vectorSourceLabel(item) }), el("p", { text: item.vectorCalibrated ? "Leitura editorial recalibrada para refletir a trajetória e o programa do partido." : "Leitura editorial da posição do partido nos 12 eixos." }))));
    const cta = el("section", { class: "catalog-profile-cta" }, el("div", {}, el("span", { class: "eyebrow", text: "Teste político" }), el("h2", { text: "Você se identifica com este perfil?" }), el("p", { text: `Responda ao quiz e veja sua compatibilidade com ${item.nome} e outros partidos nos 12 eixos.` })), el("a", { class: "atlas-button", href: "/teste-politico" }, el("span", { text: "Fazer o teste" }), icon("fa-arrow-right")));
    shell.append(back, el("div", { class: "catalog-profile-content" }, hero, tabs, axesPanel, ideologyPanel, peoplePanel, partyPanel, distinction, cta), close);
    return shell;
  };

  const renderDialog = (item) => {
    const dialog = document.getElementById("catalog-dialog");
    if (!dialog) return;
    const config = currentConfig();
    if (itemKind(item) === "ideologia" && state.tab === "ideologias") {
      dialog.classList.add("catalog-profile-dialog");
      dialog.style.setProperty("--fam", config.colorOf(item));
      dialog.replaceChildren(buildProfileView(item));
      return;
    }
    if (state.tab === "paises") {
      dialog.classList.add("catalog-profile-dialog");
      dialog.style.setProperty("--fam", config.colorOf(item));
      dialog.replaceChildren(buildCountryProfileView(item));
      return;
    }
    if (state.tab === "personalidades") {
      dialog.classList.add("catalog-profile-dialog");
      dialog.style.setProperty("--fam", config.colorOf(item));
      dialog.replaceChildren(buildPersonalityProfileView(item));
      return;
    }
    if (state.tab === "partidos") {
      dialog.classList.add("catalog-profile-dialog");
      dialog.style.setProperty("--fam", config.colorOf(item));
      dialog.replaceChildren(buildPartyProfileView(item));
      return;
    }
    dialog.classList.remove("catalog-profile-dialog");
    const color = config.colorOf(item);
    dialog.style.setProperty("--fam", color);

    const tags = el(
      "div",
      { class: "atlas-card-tags" },
      (config.tags(item) || []).filter(Boolean).map((tag, index) => makeTag(tag, index === 0 ? color : null))
    );
    const title = el("h2", { id: "catalog-dialog-title", text: item.nome });
    const subtitleParts = [config.subtitle(item), item.periodo].filter(Boolean);
    const close = el("button", { class: "atlas-dialog-close", type: "button", "aria-label": "Fechar ficha" }, icon("fa-xmark"));
    close.addEventListener("click", () => closeDialog());
    const head = el(
      "div",
      { class: "atlas-dialog-head" },
      dialogMedia(item, config),
      el("div", { class: "atlas-dialog-title" }, tags, title, el("p", { text: subtitleParts.join(" · ") }), compareProfileAction(item)),
      close
    );

    const body = el("div", { class: "atlas-dialog-body" });
    body.append(el("p", { class: "atlas-dialog-summary", text: config.summary(item) }));
    const description = config.descriptionText(item);
    if (description && normalize(description) !== normalize(config.summary(item))) {
      body.append(el("p", { class: "catalog-dialog-description", text: description }));
    }

    if (itemKind(item) === "valor") {
      addSection(body, "Grupo", "fa-layer-group", el("p", { class: "atlas-dialog-summary", text: item.group }));
      const known = (item.knownAxes || []).length;
      if (known < 12) {
        addSection(
          body,
          "Perfil parcial",
          "fa-circle-half-stroke",
          el("p", {
            class: "atlas-dialog-summary",
            text: `Este conceito tem posição definida em ${known} de 12 eixos. Nos demais, a ficha mostra "Sem posição definida" em vez de presumir um polo.`
          })
        );
      }
    } else if (state.tab === "ideologias") {
      addSection(body, "Tensões internas", "fa-scale-unbalanced", bulletList(item.tensoes));
      addSection(
        body,
        "Pensadores e referências",
        "fa-user-pen",
        chipsFor(
          "personalidades",
          unique([...(item.pensadores || []), ...(MAPS.ideologyFigures.get(item.id) || [])]),
          "fa-user"
        )
      );
      addSection(
        body,
        "Partidos associados",
        "fa-flag",
        chipsFor("partidos", unique([...(item.partidos || []), ...(MAPS.ideologyParties.get(item.id) || [])]), "fa-flag")
      );
      addSection(body, "Países onde aparece", "fa-earth-americas", chipsFor("paises", MAPS.ideologyPlaces.get(item.id), "fa-flag"));
      addSection(
        body,
        "Para ler",
        "fa-book-open",
        item.livros?.length
          ? el(
              "ul",
              { class: "atlas-dialog-list" },
              item.livros.map((id) =>
                el("li", {}, el("a", { href: `/livros#${encodeURIComponent(id)}`, text: bookName(id) || id }))
              )
            )
          : null
      );
    } else if (state.tab === "personalidades") {
      addSection(body, "Corrente associada", "fa-scale-balanced", chipsFor("ideologias", [item.ideologia], "fa-scale-balanced"));
      addSection(
        body,
        "Obras no catálogo",
        "fa-book-open",
        item.obras?.length
          ? el(
              "ul",
              { class: "atlas-dialog-list" },
              item.obras.map((id) =>
                el("li", {}, el("a", { href: `/livros#${encodeURIComponent(id)}`, text: bookName(id) || id }))
              )
            )
          : null
      );
      addSection(body, "Onde se posiciona", "fa-compass", bulletList(item.marcas));
    } else if (state.tab === "paises") {
      addSection(body, "Como se organiza", "fa-landmark", bulletList(item.caracteristicas));
      addSection(body, "Correntes associadas", "fa-scale-balanced", chipsFor("ideologias", item.ideologias, "fa-scale-balanced"));
      addSection(
        body,
        "Partidos no catálogo",
        "fa-flag",
        chipsFor("partidos", unique([...(item.partidos || []), ...(MAPS.countryParties.get(item.id) || [])]), "fa-flag")
      );
    } else if (state.tab === "partidos") {
      addSection(body, "Trajetória e posições", "fa-timeline", bulletList(item.marcos));
      addSection(body, "Corrente associada", "fa-scale-balanced", chipsFor("ideologias", [item.ideologia], "fa-scale-balanced"));
      addSection(body, "País de origem", "fa-earth-americas", chipsFor("paises", [item.paisId], "fa-flag"));
    }

    addSection(body, "Retrato em 12 eixos", "fa-chart-simple", buildAxes(item));
    addSection(body, "Perfis próximos", "fa-diagram-project", buildNearby(item));
    addSection(body, "Imagem e créditos", "fa-camera", creditNode(item));
    addSection(body, "Fonte e vetor", "fa-link", sourceNode(item));

    const footer = el(
      "div",
      { class: "atlas-dialog-footer" },
      el("p", {
        text: "Os vetores são leituras editoriais aproximadas, não resultados de questionário nem classificações definitivas."
      })
    );
    if (item.source) {
      footer.append(
        el(
          "a",
          { class: "atlas-readmore", href: item.source, target: "_blank", rel: "noopener noreferrer" },
          el("span", { text: "Consultar referência" }),
          icon("fa-arrow-up-right-from-square")
        )
      );
    }
    body.append(footer);
    dialog.replaceChildren(el("div", { class: "atlas-dialog-shell" }, head, body));
  };

  const openItem = (item, tab = state.tab, options) => {
    const dialog = document.getElementById("catalog-dialog");
    if (!item || !dialog) return false;
    if (tab && tab !== state.tab && TABS[tab]) {
      const scope = tab === "ideologias" ? (itemKind(item) === "valor" ? "valores" : "ideologias") : "tudo";
      setTab(tab, { updateUrl: false, scope });
    }
    if (!dialog.open) lastFocus = document.activeElement;
    renderDialog(item);
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.documentElement.classList.add("catalog-modal-open");
    if (!options || options.updateUrl !== false) {
      window.history.replaceState(null, "", buildUrl(state.tab, item.id, state.scope));
      notifyCatalogChange();
    }
    dialog.querySelector(".atlas-dialog-close")?.focus({ preventScroll: true });
    return true;
  };

  const closeDialog = (options) => {
    const dialog = document.getElementById("catalog-dialog");
    if (!dialog || !dialog.open) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.documentElement.classList.remove("catalog-modal-open");
    if (!options || options.clearHash !== false) {
      window.history.replaceState(null, "", buildUrl(state.tab, null, state.scope));
      notifyCatalogChange();
    }
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  };

  const findItemByHash = (id) => {
    for (const [tab, items] of Object.entries(MAPS.byTab)) {
      if (items.has(id)) return { tab, item: items.get(id) };
    }
    const legacyValue = MAPS.byTab.ideologias.get(`${VALUE_ID_PREFIX}${id}`);
    if (legacyValue) return { tab: "ideologias", item: legacyValue };
    return null;
  };

  const handleLocation = () => {
    const loc = locationState();
    if (loc.tab !== state.tab) {
      setTab(loc.tab, { updateUrl: false, scope: loc.scope });
    } else if (loc.tab === "ideologias" && loc.scope !== state.scope) {
      state.scope = loc.scope;
      refreshScopeControls();
      applyIdeaFilters();
    }
    const id = hashId();
    if (!id) {
      closeDialog({ clearHash: false });
      notifyCatalogChange();
      return;
    }
    const found = findItemByHash(id);
    if (found) openItem(found.item, found.tab, { updateUrl: false });
    notifyCatalogChange();
  };

  const setTab = (tab, options) => {
    const next = TABS[tab] ? tab : "ideologias";
    const changed = next !== state.tab;
    state.tab = next;
    if (options?.scope) state.scope = options.scope;
    else if (next !== "ideologias") state.scope = "tudo";
    state.query = "";
    state.queryText = "";
    state.filters = {};
    state.sort = "curadoria";
    state.visible = PAGE_SIZE;
    if (changed) {
      state.family = "";
      state.familyType = "";
      state.axes = {};
      state.intensity = "any";
    }
    const search = document.getElementById("catalog-search");
    if (search) search.value = "";
    const genericSearch = document.getElementById("catalog-generic-search");
    if (genericSearch) genericSearch.value = "";
    const genericSort = document.getElementById("catalog-generic-sort");
    if (genericSort) genericSort.value = "curadoria";
    document.querySelectorAll('input[name="catalog-intensity"]').forEach((input) => {
      input.checked = input.value === "any";
    });
    if (options?.updateUrl !== false) {
      window.history.replaceState(null, "", buildUrl(next, null, state.scope));
      notifyCatalogChange();
    }
    renderHero();
    if (next === "ideologias") {
      renderLegend();
      renderSpectrum();
      renderScope();
      renderChips();
      renderDrawer();
      applyIdeaFilters();
    } else {
      renderSpectrum();
      renderNotice();
      renderSort();
      renderFilters();
      renderFeatured();
      applyFilters(true);
    }
  };

  const renderAll = () => {
    renderHero();
    renderLegend();
    renderSpectrum();
    if (state.tab === "ideologias") {
      renderScope();
      renderChips();
      renderDrawer();
      applyIdeaFilters();
    } else {
      renderNotice();
      renderSort();
      renderFilters();
      renderFeatured();
      applyFilters(true);
    }
  };

  const updateStickyOffset = () => {
    const header = document.querySelector(".site-header");
    const catalogMain = document.getElementById("catalog-main");
    if (!catalogMain) return;
    const position = header ? window.getComputedStyle(header).position : "static";
    const offset =
      header && (position === "sticky" || position === "fixed")
        ? Math.round(header.getBoundingClientRect().height)
        : 0;
    catalogMain.style.setProperty("--catalog-sticky-top", `${offset}px`);
  };

  const handleKeydown = (event) => {
    const dialog = document.getElementById("catalog-dialog");
    if (dialog?.open) return;
    if (event.key === "Escape") {
      const drawer = document.getElementById("catalog-filter-drawer");
      if (drawer && !drawer.hidden) closeDrawer();
      return;
    }
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const active = document.activeElement;
    if (active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable)) return;
    const target =
      state.tab === "ideologias"
        ? document.getElementById("catalog-search")
        : document.getElementById("catalog-generic-search");
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  const init = async () => {
    try {
      const response = await fetch("/data/political-catalog.json");
      if (!response.ok) throw new Error("Catálogo indisponível");
      DATA = await response.json();
      if (!DATA.profiles || !Array.isArray(DATA.axes) || DATA.axes.length !== 12) {
        throw new Error("Base do catálogo inválida");
      }
      AXIS_INDEX = new Map(DATA.axes.map((axis, index) => [axis.id, index]));
      FAMILY_COUNTS = new Map();
      GROUP_COUNTS = new Map();
      DATA.profiles.ideologies.forEach((item) => {
        if (!item.familia) return;
        FAMILY_COUNTS.set(item.familia, (FAMILY_COUNTS.get(item.familia) || 0) + 1);
      });
      DATA.profiles.values.forEach((item) => {
        if (!item.groupId) return;
        GROUP_COUNTS.set(item.groupId, (GROUP_COUNTS.get(item.groupId) || 0) + 1);
      });
      const ideaItems = buildIdeaItems(DATA);
      MAPS = buildMaps(DATA, ideaItems);
      TABS = buildTabs(ideaItems);
      const loc = locationState();
      state.tab = loc.tab;
      state.scope = loc.scope;

      const search = document.getElementById("catalog-search");
      search?.addEventListener("input", () => {
        state.query = normalize(search.value);
        state.queryText = search.value.trim();
        applyIdeaFilters();
      });

      document.getElementById("catalog-filter-toggle")?.addEventListener("click", () => {
        const drawer = document.getElementById("catalog-filter-drawer");
        if (drawer?.hidden) openDrawer();
        else closeDrawer();
      });
      document.getElementById("catalog-drawer-close")?.addEventListener("click", closeDrawer);
      document.getElementById("catalog-drawer-apply")?.addEventListener("click", closeDrawer);
      document.getElementById("catalog-drawer-clear")?.addEventListener("click", () => {
        state.axes = {};
        state.intensity = "any";
        applyIdeaFilters();
        syncDrawerState();
      });
      document.getElementById("catalog-active-clear")?.addEventListener("click", clearIdeaFilters);

      document.querySelectorAll('input[name="catalog-intensity"]').forEach((input) => {
        input.addEventListener("change", () => {
          if (!input.checked) return;
          state.intensity = input.value;
          applyIdeaFilters();
          syncDrawerState();
        });
      });

      const genericSearch = document.getElementById("catalog-generic-search");
      genericSearch?.addEventListener("input", () => {
        state.query = normalize(genericSearch.value);
        state.queryText = genericSearch.value.trim();
        applyFilters(true);
      });
      document.getElementById("catalog-generic-sort")?.addEventListener("change", (event) => {
        state.sort = event.target.value;
        applyFilters(true);
      });
      document.getElementById("catalog-generic-load-more")?.addEventListener("click", () => {
        state.visible += PAGE_SIZE;
        renderGrid();
      });

      const dialog = document.getElementById("catalog-dialog");
      if (dialog) {
        dialog.addEventListener("click", (event) => {
          if (event.target === dialog) closeDialog();
        });
        dialog.addEventListener("cancel", (event) => {
          event.preventDefault();
          closeDialog();
        });
      }

      document.addEventListener("keydown", handleKeydown);
      window.addEventListener("popstate", handleLocation);
      window.addEventListener("hashchange", handleLocation);
      window.addEventListener("resize", updateStickyOffset);
      if (document.fonts?.ready) document.fonts.ready.then(updateStickyOffset).catch(() => {});

      updateStickyOffset();
      renderAll();
      const id = hashId();
      if (id) {
        const found = findItemByHash(id);
        if (found) openItem(found.item, found.tab, { updateUrl: false });
      }
      notifyCatalogChange();
    } catch (error) {
      console.error(error);
      const message =
        "Não foi possível carregar o catálogo político. Recarregue a página para tentar novamente.";
      const sections = document.getElementById("catalog-sections");
      if (sections) {
        sections.setAttribute("aria-busy", "false");
        sections.replaceChildren(el("p", { class: "catalog-error", role: "alert", text: message }));
      }
      const generic = document.getElementById("catalog-generic-grid");
      if (generic) generic.replaceChildren(el("p", { class: "catalog-error", role: "alert", text: message }));
    }
  };

  init();
});
