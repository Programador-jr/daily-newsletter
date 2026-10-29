/**
 * Atlas político — componentes compartilhados dos catálogos.
 *
 * Cada página declara `data-atlas-page` no <body> e carrega os dados em
 * `/js/data/atlas-*.js`. Este arquivo monta os destaques, os filtros, a
 * grade de cartões e a ficha (modal) de cada item.
 */
(function () {
  const DATA = globalThis.AtlasData;
  if (!DATA || !Array.isArray(DATA.eixos)) return;

  const EIXOS = DATA.eixos;
  const FAMILIAS = DATA.familias || [];
  const AREAS = DATA.areas || {};
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLECOES = {
    ideologias: { caminho: "/catalogo-politico?catalogo=ideologias", rotulo: "Ideologia", plural: "Ideologias" },
    personalidades: { caminho: "/catalogo-politico?catalogo=personalidades", rotulo: "Personalidade", plural: "Personalidades" },
    paises: { caminho: "/catalogo-politico?catalogo=paises", rotulo: "País", plural: "Países e regimes" },
    partidos: { caminho: "/catalogo-politico?catalogo=partidos", rotulo: "Partido", plural: "Partidos" },
    livros: { caminho: "/livros", rotulo: "Livro", plural: "Livros" }
  };

  const CORES_AREA = {
    filosofo: "#526e9b",
    economista: "#8a6522",
    revolucionario: "#a33a57",
    estadista: "#35608f",
    autoritario: "#5a3b28",
    intelectual: "#5b4b84",
    filosofia: "#526e9b",
    economia: "#8a6522",
    historia: "#8f5a2e",
    brasil: "#3f7c5a",
    sociedade: "#7a4090"
  };

  const DIFICULDADES = {
    introdutorio: "Introdutório",
    intermediario: "Intermediário",
    avancado: "Avançado"
  };

  const normalize = (value) =>
    String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const familyById = (id) => FAMILIAS.find((familia) => familia.id === id);
  const areaLabel = (grupo, id) =>
    ({ personalidades: AREAS.personalidades, livros: AREAS.livros }[grupo] || []).find((area) => area.id === id)?.rotulo || id;

  function initials(name) {
    const words = String(name || "")
      .replace(/[^\p{L}\s-]/gu, " ")
      .split(/[\s-]+/)
      .filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  function el(tag, attrs, ...children) {
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
  }

  function icon(name, extraClass) {
    return el("i", { class: "fas " + name + (extraClass ? " " + extraClass : ""), "aria-hidden": "true" });
  }

  function lean(eixo, value) {
    const distance = Math.abs(value - 50);
    if (distance <= 4) return "Equilíbrio";
    const pole = value > 50 ? eixo.a : eixo.b;
    return Math.round(Math.max(value, 100 - value)) + "% " + pole;
  }

  function similarity(vector) {
    if (!Array.isArray(vector) || vector.length !== EIXOS.length) return 0;
    const total = EIXOS.reduce((sum, eixo, index) => sum + Math.abs(vector[index] - 50), 0);
    return Math.max(0, Math.round(100 - total / EIXOS.length));
  }

  function matchScore(vectorA, vectorB) {
    if (
      !Array.isArray(vectorA) ||
      !Array.isArray(vectorB) ||
      vectorA.length !== EIXOS.length ||
      vectorB.length !== EIXOS.length
    ) {
      return 0;
    }
    const total = EIXOS.reduce((sum, eixo, index) => sum + Math.abs(vectorA[index] - vectorB[index]), 0);
    return Math.max(0, Math.round(100 - total / EIXOS.length));
  }

  function nearestItems(item, limit) {
    const list = DATA[state.config.colecao] || [];
    return list
      .filter((entry) => entry.id !== item.id && Array.isArray(entry.vetor))
      .map((entry) => ({ item: entry, score: matchScore(item.vetor, entry.vetor) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 4);
  }

  function buildFingerprint(item) {
    if (!Array.isArray(item.vetor) || item.vetor.length !== EIXOS.length) return null;
    const wrap = el("div", {
      class: "atlas-fp",
      role: "img",
      "aria-label": "Impressão digital em doze eixos de " + (item.nome || item.titulo)
    });
    EIXOS.forEach((eixo, index) => {
      const value = Number(item.vetor[index]) || 0;
      const column = el("span", {
        class: "atlas-fp-col " + (value >= 50 ? "is-a" : "is-b"),
        title: eixo.rotulo + ": " + lean(eixo, value)
      });
      column.style.setProperty("--h", Math.max(1, (Math.abs(value - 50) / 50) * 14).toFixed(1) + "px");
      column.style.setProperty("--ca", "var(--ax-" + eixo.id + "-a)");
      column.style.setProperty("--cb", "var(--ax-" + eixo.id + "-b)");
      wrap.append(column);
    });
    wrap.setAttribute("aria-hidden", "true");
    return wrap;
  }

  function relatedName(collection, id) {
    const list = DATA[collection];
    if (!Array.isArray(list)) return null;
    const item = list.find((entry) => entry.id === id);
    if (!item) return null;
    return item.nome || item.titulo || id;
  }

  function collectionFor(collection) {
    return COLECOES[collection] || null;
  }

  function linkedChip(collection, id, label, iconName) {
    const meta = collectionFor(collection);
    if (!meta) return null;
    const text = label || relatedName(collection, id);
    if (!text) return null;
    return el(
      "a",
      { href: meta.caminho + "#" + encodeURIComponent(id) },
      iconName ? icon(iconName) : null,
      el("span", { text })
    );
  }

  function countryName(id) {
    return relatedName("paises", id);
  }

  function mergeIds(ids, collection, predicate) {
    const inferred = (DATA[collection] || [])
      .filter((entry) => predicate(entry))
      .map((entry) => entry.id);
    return Array.from(new Set([...(ids || []), ...inferred]));
  }

  function renderLegend() {
    const grid = document.getElementById("atlas-legend-grid");
    if (!grid) return;
    const list = el(
      "ul",
      { class: "atlas-legend-grid" },
      EIXOS.map((eixo) =>
        el(
          "li",
          {},
          el(
            "div",
            { class: "atlas-legend-axis" },
            el("strong", { text: eixo.rotulo }),
            el("small", { text: eixo.a + " ↔ " + eixo.b })
          ),
          el("p", { text: eixo.pergunta })
        )
      )
    );
    grid.replaceChildren(list);
  }

  function renderFamilies() {
    const grid = document.getElementById("atlas-families-grid");
    if (!grid) return;
    const cards = FAMILIAS.map((familia) => {
      const count = state.items.filter((item) => item.familia === familia.id).length;
      const card = el("button", {
        class: "atlas-family-card",
        type: "button",
        style: { "--fam": familia.cor },
        "aria-label": "Filtrar " + count + " ideologias da família " + familia.rotulo
      });
      card.append(
        el(
          "span",
          { class: "atlas-family-card-head" },
          el("span", { class: "atlas-family-name", text: familia.rotulo }),
          el("strong", { text: String(count) })
        ),
        el("p", { text: familia.descricao }),
        el("span", { class: "atlas-family-card-cta" }, "Filtrar esta família", icon("fa-arrow-right"))
      );
      card.addEventListener("click", () => {
        state.filters.familia = familia.id;
        renderFilters();
        applyFilters();
        document.getElementById("atlas-catalogo")?.scrollIntoView({
          behavior: REDUCED_MOTION ? "auto" : "smooth",
          block: "start"
        });
      });
      return card;
    });
    grid.replaceChildren(...cards);
  }

  function buildNearby(item) {
    const matches = nearestItems(item, 4);
    if (matches.length === 0) return null;
    const wrap = el("div", { class: "atlas-nearby" });
    matches.forEach(({ item: entry, score }) => {
      const link = el("a", {
        class: "atlas-nearby-item",
        href: "#" + encodeURIComponent(entry.id)
      });
      link.append(
        el("span", { class: "atlas-nearby-name", text: entry.nome || entry.titulo }),
        el("span", { class: "atlas-nearby-score", text: score + "%" })
      );
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openItem(entry.id);
      });
      wrap.append(link);
    });
    return wrap;
  }

  function initExplorer() {
    const grid = document.getElementById("atlas-slider-grid");
    const resultList = document.getElementById("atlas-match-list");
    if (!grid || !resultList) return;
    const values = new Array(EIXOS.length).fill(50);

    const renderMatches = () => {
      const ranked = state.items
        .filter((item) => Array.isArray(item.vetor))
        .map((item) => ({ item, score: matchScore(values, item.vetor) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      resultList.replaceChildren(
        ...ranked.map(({ item, score }, index) => {
          const link = el("a", {
            class: "atlas-match",
            href: "#" + encodeURIComponent(item.id)
          });
          const name = el("span", { class: "atlas-match-name" });
          name.append(
            el("strong", { text: item.nome }),
            el("small", { text: familyById(item.familia)?.rotulo || item.periodo || "" })
          );
          link.append(
            el("span", { class: "atlas-match-rank", text: String(index + 1).padStart(2, "0") }),
            name,
            el("span", { class: "atlas-match-score", text: score + "%" })
          );
          link.addEventListener("click", (event) => {
            event.preventDefault();
            openItem(item.id);
          });
          return el("li", {}, link);
        })
      );
    };

    EIXOS.forEach((eixo, index) => {
      const inputId = "atlas-slider-" + eixo.id;
      const output = el("output", { for: inputId, text: "50 · Equilíbrio" });
      const input = el("input", {
        id: inputId,
        type: "range",
        min: "0",
        max: "100",
        step: "1",
        value: "50",
        "aria-label": eixo.rotulo + ": " + eixo.a + " a " + eixo.b
      });
      input.addEventListener("input", () => {
        values[index] = Number(input.value);
        output.textContent = input.value + " · " + lean(eixo, Number(input.value));
        renderMatches();
      });
      grid.append(
        el(
          "div",
          { class: "atlas-slider" },
          el(
            "div",
            { class: "atlas-slider-head" },
            el("label", { for: inputId, text: eixo.rotulo }),
            output
          ),
          input,
          el(
            "div",
            { class: "atlas-slider-poles" },
            el("span", { text: eixo.a }),
            el("span", { text: eixo.b })
          )
        )
      );
    });

    document.getElementById("atlas-explorer-reset")?.addEventListener("click", () => {
      values.fill(50);
      grid.querySelectorAll('input[type="range"]').forEach((input) => {
        input.value = "50";
        const index = EIXOS.findIndex((eixo) => "atlas-slider-" + eixo.id === input.id);
        if (index >= 0) {
          const output = grid.querySelector('output[for="' + input.id + '"]');
          if (output) output.textContent = "50 · Equilíbrio";
        }
      });
      renderMatches();
    });

    renderMatches();
  }

  const PAGE_CONFIGS = {
    ideologias: {
      colecao: "ideologias",
      singular: "ideologia",
      plural: "ideologias",
      destaques: ["social-democracia", "liberalismo-classico", "anarcocomunismo"],
      busca: "Buscar ideologia, pensador ou partido...",
      familyOf: (item) => item.familia,
      colorOf: (item) => familyById(item.familia)?.cor,
      mark: (item) => initials(item.nome),
      markClass: "",
      tags: (item) => [familyById(item.familia)?.rotulo, item.periodo],
      subtitle: (item) => item.ideia,
      summary: (item) => item.resumo,
      search: (item) =>
        [
          item.nome,
          item.resumo,
          item.ideia,
          item.periodo,
          familyById(item.familia)?.rotulo,
          mergeIds(item.pensadores, "personalidades", (entry) => entry.ideologia === item.id)
            .map((id) => relatedName("personalidades", id))
            .filter(Boolean)
            .join(" "),
          mergeIds(item.partidos, "partidos", (entry) => entry.ideologia === item.id)
            .map((id) => relatedName("partidos", id))
            .filter(Boolean)
            .join(" "),
          mergeIds(item.livros, "livros", (entry) => (entry.ideologias || []).includes(item.id))
            .map((id) => relatedName("livros", id))
            .filter(Boolean)
            .join(" ")
        ].join(" "),
      filters: [
        {
          key: "familia",
          label: "Família",
          options: () => FAMILIAS.map((familia) => ({ value: familia.id, label: familia.rotulo })),
          get: (item) => item.familia
        }
      ],
      sorts: [
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Nome (A–Z)" },
        { value: "za", label: "Nome (Z–A)" }
      ],
      cta: "Explorar ideologia"
    },
    personalidades: {
      colecao: "personalidades",
      singular: "personalidade",
      plural: "personalidades",
      destaques: ["karl-marx", "keynes", "getulio-vargas"],
      busca: "Buscar nome, ideia, país ou corrente...",
      colorOf: (item) => CORES_AREA[item.area],
      mark: (item) => initials(item.nome),
      tags: (item) => [areaLabel("personalidades", item.area), item.pais, item.periodo],
      subtitle: (item) => item.papel,
      summary: (item) => item.resumo,
      search: (item) =>
        [
          item.nome,
          item.papel,
          item.resumo,
          item.pais,
          item.periodo,
          areaLabel("personalidades", item.area),
          relatedName("ideologias", item.ideologia),
          mergeIds(item.obras, "livros", (entry) => entry.autorId === item.id)
            .map((id) => relatedName("livros", id))
            .filter(Boolean)
            .join(" ")
        ].join(" "),
      filters: [
        {
          key: "area",
          label: "Área",
          options: () => (AREAS.personalidades || []).map((area) => ({ value: area.id, label: area.rotulo })),
          get: (item) => item.area
        },
        {
          key: "origem",
          label: "Origem",
          options: () => [
            { value: "brasil", label: "Brasil" },
            { value: "mundo", label: "Internacional" }
          ],
          get: (item) => (item.pais === "Brasil" ? "brasil" : "mundo")
        }
      ],
      sorts: [
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Nome (A–Z)" },
        { value: "za", label: "Nome (Z–A)" }
      ],
      cta: "Conhecer trajetória"
    },
    paises: {
      colecao: "paises",
      singular: "país",
      plural: "países",
      destaques: ["brasil", "estados-unidos", "uniao-sovietica"],
      busca: "Buscar país, regime ou período...",
      colorOf: (item) => (item.historico ? "#8f5a2e" : "#147d6f"),
      mark: (item) => item.bandeira || item.sigla || initials(item.nome),
      markClass: (item) => (item.bandeira ? "atlas-mark-flag" : "atlas-mark-sigla"),
      tags: (item) => [item.regiao, item.periodo, item.historico ? "Histórico" : "Atual"],
      subtitle: (item) => item.categoria,
      summary: (item) => item.resumo,
      search: (item) =>
        [
          item.nome,
          item.categoria,
          item.resumo,
          item.regiao,
          item.periodo,
          (item.caracteristicas || []).join(" "),
          mergeIds(item.partidos, "partidos", (entry) => entry.paisId === item.id)
            .map((id) => relatedName("partidos", id))
            .filter(Boolean)
            .join(" ")
        ].join(" "),
      filters: [
        {
          key: "tipo",
          label: "Tipo",
          options: () => [
            { value: "atual", label: "Atuais" },
            { value: "historico", label: "Históricos" }
          ],
          get: (item) => (item.historico ? "historico" : "atual")
        },
        {
          key: "regiao",
          label: "Região",
          options: () =>
            Array.from(new Set((DATA.paises || []).map((pais) => pais.regiao)))
              .filter(Boolean)
              .map((regiao) => ({ value: regiao, label: regiao })),
          get: (item) => item.regiao
        }
      ],
      sorts: [
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Nome (A–Z)" },
        { value: "za", label: "Nome (Z–A)" }
      ],
      cta: "Ver perfil do país"
    },
    partidos: {
      colecao: "partidos",
      singular: "partido",
      plural: "partidos",
      destaques: ["pt", "psdb", "pl"],
      busca: "Buscar partido, país ou corrente...",
      familyOf: (item) => item.espectro,
      colorOf: (item) => familyById(item.espectro)?.cor,
      mark: (item) => item.sigla || initials(item.nome),
      markClass: () => "atlas-mark-sigla",
      tags: (item) => [familyById(item.espectro)?.rotulo, countryName(item.paisId), item.periodo],
      subtitle: (item) => item.orientacao || countryName(item.paisId),
      summary: (item) => item.resumo,
      search: (item) =>
        [
          item.nome,
          item.sigla,
          item.orientacao,
          item.resumo,
          item.periodo,
          countryName(item.paisId),
          familyById(item.espectro)?.rotulo,
          (item.marcos || []).join(" ")
        ].join(" "),
      filters: [
        {
          key: "regiao",
          label: "Região",
          options: () =>
            Array.from(new Set((DATA.partidos || []).map((partido) => partido.regiao)))
              .filter(Boolean)
              .map((regiao) => ({ value: regiao, label: regiao })),
          get: (item) => item.regiao
        },
        {
          key: "tipo",
          label: "Tipo",
          options: () => [
            { value: "atual", label: "Atuais" },
            { value: "historico", label: "Históricos" }
          ],
          get: (item) => (item.historico ? "historico" : "atual")
        }
      ],
      sorts: [
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Nome (A–Z)" },
        { value: "za", label: "Nome (Z–A)" }
      ],
      cta: "Ver trajetória"
    },
    livros: {
      colecao: "livros",
      singular: "livro",
      plural: "livros",
      destaques: ["leviata", "o-manifesto-comunista", "raizes-do-brasil"],
      busca: "Buscar título, autor, tema ou corrente...",
      colorOf: (item) => CORES_AREA[item.area],
      mark: (item) => String(item.ano),
      markClass: () => "atlas-mark-sigla",
      tags: (item) => [areaLabel("livros", item.area), DIFICULDADES[item.dificuldade], (item.temas || []).slice(0, 1)[0]],
      subtitle: (item) => item.autor,
      summary: (item) => item.porque,
      search: (item) =>
        [
          item.titulo,
          item.autor,
          item.resumo,
          item.porque,
          areaLabel("livros", item.area),
          DIFICULDADES[item.dificuldade],
          (item.temas || []).join(" "),
          (item.ideologias || []).map((id) => relatedName("ideologias", id)).filter(Boolean).join(" ")
        ].join(" "),
      filters: [
        {
          key: "area",
          label: "Área",
          options: () => (AREAS.livros || []).map((area) => ({ value: area.id, label: area.rotulo })),
          get: (item) => item.area
        },
        {
          key: "dificuldade",
          label: "Leitura",
          options: () =>
            Object.entries(DIFICULDADES).map(([value, label]) => ({ value, label })),
          get: (item) => item.dificuldade
        },
        {
          key: "seculo",
          label: "Século",
          options: () => [
            { value: "pre-1800", label: "Até 1800" },
            { value: "xix", label: "Século XIX" },
            { value: "xx", label: "Século XX" },
            { value: "xxi", label: "Século XXI" }
          ],
          get: (item) => centuryKey(item.ano)
        }
      ],
      sorts: [
        { value: "curadoria", label: "Ordem editorial" },
        { value: "az", label: "Título (A–Z)" },
        { value: "ano-asc", label: "Mais antigos" },
        { value: "ano-desc", label: "Mais recentes" }
      ],
      cta: "Sobre o livro"
    }
  };

  function centuryKey(year) {
    const value = Number(year);
    if (!Number.isFinite(value)) return "";
    if (value < 1800) return "pre-1800";
    if (value < 1900) return "xix";
    if (value < 2000) return "xx";
    return "xxi";
  }

  function makeMark(item, config) {
    const mark = el("span", { class: "atlas-mark" + (config.markClass ? " " + (config.markClass(item) || "") : "") });
    const color = config.colorOf ? config.colorOf(item) : null;
    if (color) mark.style.setProperty("--fam", color);
    mark.textContent = config.mark(item);
    return mark;
  }

  function makeTag(text, familyId) {
    const tag = el("span", { class: "atlas-tag" + (familyId ? " atlas-tag-fam" : "") });
    if (familyId) {
      const family = familyById(familyId);
      if (family) tag.style.setProperty("--fam", family.cor);
    }
    tag.textContent = text;
    return tag;
  }

  function makeCard(item, config, featured) {
    const color = config.colorOf ? config.colorOf(item) : null;
    const card = el("a", {
      class: "atlas-card",
      href: "#" + encodeURIComponent(item.id),
      "aria-label": (config.singular === "livro" ? "Ver detalhes de " : "Explorar ") + (item.nome || item.titulo)
    });
    if (color) card.style.setProperty("--fam", color);
    if (featured) card.dataset.featured = "true";

    const tags = el("div", { class: "atlas-card-tags" });
    (config.tags(item) || [])
      .filter(Boolean)
      .slice(0, 3)
      .forEach((tag, index) => {
        tags.append(makeTag(tag, index === 0 && config.familyOf ? config.familyOf(item) : null));
      });

    const bookImage = config.colecao === "livros"
      ? (item.imagePath
        ? el("img", { class: "atlas-book-card-image", src: item.imagePath, alt: item.imageAlt || "Retrato de " + item.autor, loading: "lazy", decoding: "async" })
        : el("div", { class: "atlas-book-card-fallback", role: "img", "aria-label": "Imagem não disponível; autor: " + item.autor }, initials(item.autor)))
      : null;
    if (bookImage?.tagName === "IMG") {
      bookImage.addEventListener("error", () => {
        bookImage.replaceWith(el("div", { class: "atlas-book-card-fallback", role: "img", "aria-label": "Imagem não disponível; autor: " + item.autor }, initials(item.autor)));
      }, { once: true });
    }

    card.append(
      el(
        "div",
        { class: "atlas-card-top" },
        makeMark(item, config),
        tags
      ),
      bookImage,
      el("h3", { text: item.nome || item.titulo }),
      el("p", { class: "atlas-card-sub", text: config.subtitle(item) })
    );

    const fingerprint = buildFingerprint(item);
    if (fingerprint) card.append(fingerprint);

    card.append(el("p", { class: "atlas-card-summary", text: config.summary(item) }));
    card.append(
      el(
        "span",
        { class: "atlas-card-cta" },
        el("span", { text: config.cta }),
        icon("fa-arrow-right")
      )
    );

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openItem(item.id);
    });
    return card;
  }

  function findItem(id, collection) {
    const key = collection || state.config.colecao;
    const list = DATA[key] || [];
    return list.find((item) => item.id === id) || null;
  }

  function addSection(body, title, iconName, content) {
    if (!content) return;
    const section = el("section", { class: "atlas-dialog-section" });
    section.append(el("h3", {}, icon(iconName), el("span", { text: title })));
    section.append(content);
    body.append(section);
  }

  function bulletList(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return el("ul", { class: "atlas-dialog-list" }, items.map((item) => el("li", { text: item })));
  }

  function buildAxes(item) {
    if (!Array.isArray(item.vetor) || item.vetor.length !== EIXOS.length) return null;
    const list = el("ul", { class: "atlas-axis-list" });
    EIXOS.forEach((eixo, index) => {
      const value = Math.max(0, Math.min(100, Number(item.vetor[index]) || 0));
      const row = el("li", { class: "atlas-axis-row" });
      row.style.setProperty("--ca", "var(--ax-" + eixo.id + "-a)");
      row.style.setProperty("--cb", "var(--ax-" + eixo.id + "-b)");
      row.style.setProperty("--marker", "var(--ax-" + eixo.id + (value >= 50 ? "-a" : "-b") + ")");
      row.append(
        el(
          "div",
          { class: "atlas-axis-row-head" },
          el("span", { text: eixo.rotulo }),
          el("strong", { text: lean(eixo, value) })
        ),
        el("div", { class: "atlas-axis-track" }, el("span", { class: "atlas-axis-marker" }))
      );
      row.querySelector(".atlas-axis-marker").style.setProperty("--p", String(100 - value));
      row.append(
        el(
          "div",
          { class: "atlas-axis-poles-row" },
          el("span", { text: eixo.a }),
          el("span", { text: eixo.b })
        )
      );
      list.append(row);
    });
    return list;
  }

  function chipsFor(collection, ids, iconName) {
    if (!Array.isArray(ids) || ids.length === 0) return null;
    const wrap = el("div", { class: "atlas-related" });
    ids.forEach((id) => {
      const chip = linkedChip(collection, id, null, iconName);
      if (chip) wrap.append(chip);
    });
    return wrap.childElementCount ? wrap : null;
  }

  function renderDialog(item, config) {
    const dialog = document.getElementById("atlas-dialog");
    if (!dialog) return;
    const color = config.colorOf ? config.colorOf(item) : null;
    if (color) dialog.style.setProperty("--fam", color);
    else dialog.style.removeProperty("--fam");

    const name = item.nome || item.titulo;
    const title = el("h2", { id: "atlas-dialog-title", text: name });
    const subtitleParts = [config.subtitle(item), item.periodo].filter(Boolean);
    const tags = el(
      "div",
      { class: "atlas-card-tags" },
      (config.tags(item) || [])
        .filter(Boolean)
        .map((tag, index) => makeTag(tag, index === 0 && config.familyOf ? config.familyOf(item) : null))
    );

    const close = el(
      "button",
      { class: "atlas-dialog-close", type: "button", "aria-label": "Fechar ficha" },
      icon("fa-xmark")
    );
    close.addEventListener("click", () => closeDialog());

    const head = el(
      "div",
      { class: "atlas-dialog-head" },
      makeMark(item, config),
      el("div", { class: "atlas-dialog-title" }, tags, title, el("p", { text: subtitleParts.join(" · ") })),
      close
    );

    const body = el("div", { class: "atlas-dialog-body" });
    if (config.colecao === "livros") {
      if (item.imagePath) {
        const cover = el("img", {
          class: "atlas-dialog-book-cover",
          src: item.imagePath,
          alt: item.imageAlt || "Retrato de " + item.autor,
          loading: "lazy"
        });
        cover.addEventListener("error", () => cover.remove());
        head.insertBefore(cover, close);
      }
      const author =
        item.autorId && relatedName("personalidades", item.autorId)
          ? el(
              "a",
              {
                class: "atlas-inline-link",
                href: "/catalogo-politico?catalogo=personalidades#" + encodeURIComponent(item.autorId)
              },
              el("span", { text: item.autor })
            )
          : document.createTextNode(item.autor);
      const ficha = el(
        "div",
        {},
        el(
          "ul",
          { class: "atlas-dialog-list" },
          el("li", {}, el("span", { text: "Autor: " }), author),
          el("li", { text: "Publicação: " + item.ano }),
          el("li", { text: "Área: " + areaLabel("livros", item.area) }),
          el("li", { text: "Nível de leitura: " + (DIFICULDADES[item.dificuldade] || item.dificuldade || "Não informado") })
        ),
        el("p", { class: "atlas-dialog-summary", text: item.resumo || "Ficha editorial não disponível." })
      );
      const relatedIdeologies = chipsFor("ideologias", item.ideologias, "fa-scale-balanced");
      if (relatedIdeologies) {
        ficha.append(el("p", { class: "atlas-dialog-label", text: "Correntes relacionadas" }), relatedIdeologies);
      }
      addSection(body, "Ficha", "fa-circle-info", ficha);
      addSection(body, "Por que ler", "fa-lightbulb", el("p", { class: "atlas-dialog-summary", text: item.porque || "Leia esta obra para conhecer os argumentos e o contexto de seu autor." }));
      const footer = el(
        "div",
        { class: "atlas-dialog-footer" },
        el("p", {
          text: "Resumo, classificação e nota de leitura são editoriais do King's Newsletter; não substituem a obra."
        })
      );
      if (item.link) {
        footer.append(
          el(
            "a",
            { class: "atlas-readmore", href: item.link, target: "_blank", rel: "noopener noreferrer" },
            el("span", { text: "Consultar no Open Library" }),
            icon("fa-arrow-up-right-from-square")
          )
        );
      }
      body.append(footer);
      dialog.replaceChildren(el("div", { class: "atlas-dialog-shell" }, head, body));
      return;
    }
    body.append(el("p", { class: "atlas-dialog-summary", text: item.resumo || config.summary(item) }));

    if (config.colecao === "ideologias") {
      addSection(body, "Tensões internas", "fa-scale-unbalanced", bulletList(item.tensoes));
      addSection(
        body,
        "Pensadores e referências",
        "fa-user-pen",
        chipsFor(
          "personalidades",
          mergeIds(item.pensadores, "personalidades", (entry) => entry.ideologia === item.id),
          "fa-user"
        )
      );
      addSection(
        body,
        "Partidos associados",
        "fa-flag",
        chipsFor("partidos", mergeIds(item.partidos, "partidos", (entry) => entry.ideologia === item.id), "fa-flag")
      );
      addSection(
        body,
        "Para ler",
        "fa-book-open",
        chipsFor(
          "livros",
          mergeIds(item.livros, "livros", (entry) => (entry.ideologias || []).includes(item.id)),
          "fa-book"
        )
      );
      const countries = (DATA.paises || [])
        .filter((pais) => (pais.ideologias || []).includes(item.id))
        .map((pais) => pais.id);
      addSection(body, "Países onde aparece", "fa-earth-americas", chipsFor("paises", countries, "fa-flag"));
    } else if (config.colecao === "personalidades") {
      addSection(body, "Corrente associada", "fa-scale-balanced", chipsFor("ideologias", [item.ideologia], "fa-scale-balanced"));
      addSection(
        body,
        "Obras no catálogo",
        "fa-book-open",
        chipsFor("livros", mergeIds(item.obras, "livros", (entry) => entry.autorId === item.id), "fa-book")
      );
      addSection(body, "Onde se posiciona", "fa-compass", bulletList(item.marcas));
    } else if (config.colecao === "paises") {
      addSection(body, "Como se organiza", "fa-landmark", bulletList(item.caracteristicas));
      addSection(body, "Correntes associadas", "fa-scale-balanced", chipsFor("ideologias", item.ideologias, "fa-scale-balanced"));
      addSection(
        body,
        "Partidos no atlas",
        "fa-flag",
        chipsFor("partidos", mergeIds(item.partidos, "partidos", (entry) => entry.paisId === item.id), "fa-flag")
      );
    } else if (config.colecao === "partidos") {
      addSection(body, "Trajetória e posições", "fa-timeline", bulletList(item.marcos));
      addSection(body, "Corrente associada", "fa-scale-balanced", chipsFor("ideologias", [item.ideologia], "fa-scale-balanced"));
      addSection(body, "País de origem", "fa-earth-americas", chipsFor("paises", [item.paisId], "fa-flag"));
    }

    addSection(body, "Retrato em 12 eixos", "fa-chart-simple", buildAxes(item));
    addSection(
      body,
      config.colecao === "livros" ? "Obras próximas" : "Perfis próximos",
      "fa-diagram-project",
      buildNearby(item)
    );

    const footer = el(
      "div",
      { class: "atlas-dialog-footer" },
      el("p", {
        text:
          config.colecao === "livros"
            ? "Vetores e resumos são leituras editoriais do King's Newsletter; não substituem a obra."
            : "O vetor é uma leitura editorial aproximada, não um resultado de questionário nem uma classificação definitiva."
      })
    );
    if (item.link) {
      footer.append(
        el(
          "a",
          { class: "atlas-readmore", href: item.link, target: "_blank", rel: "noopener noreferrer" },
          el("span", { text: "Consultar referência" }),
          icon("fa-arrow-up-right-from-square")
        )
      );
    }
    body.append(footer);

    dialog.replaceChildren(el("div", { class: "atlas-dialog-shell" }, head, body));
  }

  let lastFocus = null;

  function openItem(id, options) {
    const item = findItem(id);
    if (!item) return false;
    const dialog = document.getElementById("atlas-dialog");
    if (!dialog) return false;
    if (!dialog.open) lastFocus = document.activeElement;
    renderDialog(item, state.config);
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.documentElement.classList.add("atlas-modal-open");
    if (!options || options.updateHash !== false) {
      window.history.replaceState(null, "", "#" + encodeURIComponent(item.id));
    }
    dialog.querySelector(".atlas-dialog-close")?.focus({ preventScroll: true });
    return true;
  }

  function closeDialog(options) {
    const dialog = document.getElementById("atlas-dialog");
    if (!dialog || !dialog.open) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.documentElement.classList.remove("atlas-modal-open");
    if (!options || options.clearHash !== false) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  const state = {
    config: null,
    items: [],
    filtered: [],
    filters: {},
    query: "",
    sort: "curadoria"
  };

  function matches(item) {
    if (state.query) {
      const haystack = normalize(state.config.search(item));
      if (!haystack.includes(state.query)) return false;
    }
    return state.config.filters.every((filter) => {
      const active = state.filters[filter.key];
      if (!active) return true;
      return normalize(filter.get(item)) === normalize(active);
    });
  }

  function sortItems(items) {
    const list = items.slice();
    if (state.sort === "az" || state.sort === "za") {
      list.sort((a, b) =>
        String(a.nome || a.titulo).localeCompare(String(b.nome || b.titulo), "pt-BR", { sensitivity: "base" })
      );
      if (state.sort === "za") list.reverse();
    } else if (state.sort === "ano-asc" || state.sort === "ano-desc") {
      list.sort((a, b) => Number(a.ano) - Number(b.ano));
      if (state.sort === "ano-desc") list.reverse();
    }
    return list;
  }

  function renderGrid() {
    const grid = document.getElementById("atlas-grid");
    if (!grid) return;
    const frag = document.createDocumentFragment();
    state.filtered.forEach((item) => frag.append(makeCard(item, state.config, false)));
    grid.replaceChildren(frag);
    if (state.filtered.length === 0) {
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
    const count = document.getElementById("atlas-count");
    if (count) {
      const total = state.items.length;
      count.textContent =
        state.filtered.length === total
          ? total + " " + state.config.plural
          : state.filtered.length + " de " + total + " " + state.config.plural;
    }
    const clear = document.getElementById("atlas-clear");
    if (clear) {
      const hasFilters = Boolean(state.query) || Object.values(state.filters).some(Boolean);
      clear.hidden = !hasFilters;
    }
  }

  function applyFilters() {
    state.filtered = sortItems(state.items.filter(matches));
    renderGrid();
  }

  function renderFilters() {
    const container = document.getElementById("atlas-filters");
    if (!container) return;
    container.replaceChildren();
    state.config.filters.forEach((filter) => {
      const group = el("div", { class: "atlas-filter-group" });
      group.append(el("span", { class: "atlas-filter-label", text: filter.label }));
      const chipRow = el("div", { class: "atlas-chips-row" });
      const options = [{ value: "", label: "Todas" }, ...filter.options()];
      options.forEach((option) => {
        const chip = el("button", {
          class: "atlas-chip",
          type: "button",
          "aria-pressed": String((state.filters[filter.key] || "") === option.value),
          "data-filter": filter.key,
          "data-value": option.value
        });
        chip.textContent = option.label;
        chip.addEventListener("click", () => {
          state.filters[filter.key] = option.value;
          group.querySelectorAll(".atlas-chip").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.value === option.value));
          });
          applyFilters();
        });
        chipRow.append(chip);
      });
      group.append(chipRow);
      container.append(group);
    });

    const clear = el("button", { class: "atlas-clear", type: "button", id: "atlas-clear", hidden: true, text: "Limpar filtros" });
    clear.addEventListener("click", () => {
      state.query = "";
      state.filters = {};
      state.sort = "curadoria";
      const search = document.getElementById("atlas-search");
      if (search) search.value = "";
      const sort = document.getElementById("atlas-sort");
      if (sort) sort.value = "curadoria";
      renderFilters();
      applyFilters();
      search?.focus();
    });
    container.append(clear);
    const count = el("p", { class: "atlas-filters-count", id: "atlas-count", "aria-live": "polite" });
    container.append(count);
  }

  function renderSort() {
    const select = document.getElementById("atlas-sort");
    if (!select) return;
    select.replaceChildren();
    state.config.sorts.forEach((sort) => {
      const option = el("option", { value: sort.value, text: sort.label });
      select.append(option);
    });
    select.value = state.sort;
    select.addEventListener("change", () => {
      state.sort = select.value;
      applyFilters();
    });
  }

  function renderFeatured() {
    const section = document.getElementById("atlas-featured");
    const grid = document.getElementById("atlas-featured-grid");
    if (!section || !grid) return;
    const ids = state.config.destaques || state.items.slice(0, 3).map((item) => item.id);
    const items = ids.map((id) => state.items.find((item) => item.id === id)).filter(Boolean);
    state.items.slice(0, 3 - items.length).forEach((item) => {
      if (!items.some((entry) => entry.id === item.id)) items.push(item);
    });
    if (items.length === 0) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    grid.replaceChildren(...items.map((item) => makeCard(item, state.config, true)));
    const label = section.querySelector("[data-atlas-featured-label]");
    if (label) label.textContent = "Seleção editorial de " + state.config.plural;
  }

  function renderStats() {
    document.querySelectorAll("[data-atlas-stat]").forEach((node) => {
      const key = node.dataset.atlasStat;
      if (key === "total") node.textContent = String(state.items.length);
      else if (key === "eixos") node.textContent = String(EIXOS.length);
      else if (key === "familias") node.textContent = String(FAMILIAS.length);
      else if (key === "areas") node.textContent = String((AREAS.livros || []).length);
    });
  }

  function renderBookSpectrum() {
    const spectrum = document.getElementById("atlas-book-spectrum");
    if (!spectrum || state.config.colecao !== "livros") return;
    const areas = AREAS.livros || [];
    const colors = ["#35608f", "#526e9b", "#7a4090", "#8a6522", "#3f7c5a", "#a33a57", "#8f5a2e", "#5a3b28"];
    spectrum.replaceChildren(
      el("span", { class: "atlas-book-spectrum-label", text: "Distribuição por área" }),
      el("div", { class: "atlas-book-spectrum-bar" }, areas.map((area, index) => {
        const count = state.items.filter((item) => item.area === area.id).length;
        return el("span", { class: "atlas-book-spectrum-segment", style: { "--n": String(Math.max(1, count)), "--c": colors[index] || "#35608f" }, title: `${area.rotulo}: ${count} livros` }, el("b", { text: area.rotulo }), el("em", { text: String(count) }));
      }))
    );
  }

  function handleHash() {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) {
      closeDialog({ clearHash: false });
      return;
    }
    if (!openItem(id, { updateHash: false })) {
      closeDialog({ clearHash: false });
    }
  }

  function init() {
    const page = document.body.dataset.atlasPage;
    const config = PAGE_CONFIGS[page];
    if (!config) return;
    const items = DATA[config.colecao];
    if (!Array.isArray(items)) {
      console.warn("Atlas: dados ausentes para", config.colecao);
      return;
    }
    state.config = config;
    state.items = items;
    state.filters = {};
    config.filters.forEach((filter) => {
      state.filters[filter.key] = "";
    });

    renderLegend();
    renderFamilies();
    initExplorer();
    renderStats();
    renderBookSpectrum();
    renderSort();
    renderFilters();
    renderFeatured();

    const search = document.getElementById("atlas-search");
    if (search) {
      search.placeholder = config.busca;
      search.addEventListener("input", () => {
        state.query = normalize(search.value);
        applyFilters();
      });
    }

    applyFilters();

    const dialog = document.getElementById("atlas-dialog");
    if (dialog) {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog();
      });
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeDialog();
      });
    }
    window.addEventListener("hashchange", handleHash);
    handleHash();
  }

  globalThis.Atlas = {
    el,
    icon,
    initials,
    lean,
    similarity,
    normalize,
    familyById,
    areaLabel,
    difficultyLabel: (id) => DIFICULDADES[id] || id,
    eixos: EIXOS,
    openItem,
    closeDialog,
    reducedMotion: REDUCED_MOTION
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
