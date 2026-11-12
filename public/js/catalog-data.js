/**
 * Carregador do catálogo político dividido.
 *
 * A base completa (public/data/political-catalog.json) passa de 3 MB, mas cada
 * página precisa de uma parte dela. scripts/split-political-catalog.js gera:
 *   /data/catalog/core.json             todos os perfis, sem campos repetidos e
 *                                       sem os textos longos da ficha
 *   /data/catalog/details-<grupo>.json  textos da ficha de cada seção
 *   /data/catalog/quiz.json             perguntas e recomendações do teste
 *
 * Este módulo baixa só o que foi pedido, uma vez por página, e devolve os
 * perfis no mesmo formato da base completa (os campos repetidos, como
 * summary/resumo e axes/vetor, são reconstruídos aqui).
 *
 * As funções puras também são exportadas para o Node: o gerador e os testes
 * conferem que core + details + quiz reconstroem exatamente a base original.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CatalogData = api;
})(typeof self !== "undefined" ? self : this, () => {
  const BASE_PATH = "/data/catalog/";

  // Coleções de perfis agrupadas como as páginas do catálogo as exibem.
  const DETAIL_GROUPS = {
    ideologias: ["ideologies", "values"],
    personalidades: ["figures"],
    paises: ["countries", "regimes"],
    partidos: ["parties"]
  };
  const GROUP_BY_COLLECTION = Object.fromEntries(
    Object.entries(DETAIL_GROUPS).flatMap(([group, collections]) =>
      collections.map((collection) => [collection, group])
    )
  );

  const formatOf = (core) => core._format;

  // Recria um campo omitido a partir do campo de que ele era cópia. A regra só
  // existe para coleções em que todo perfil tinha o campo, então a ausência
  // sempre significa "igual ao campo de origem".
  const applyAliases = (item, aliases, collection, stage) => {
    for (const rule of aliases) {
      if (rule.stage !== stage || !rule.collections.includes(collection)) continue;
      if (!(rule.field in item) && rule.from in item) item[rule.field] = item[rule.from];
    }
  };

  const hydrateCore = (core) => {
    const format = formatOf(core);
    // _format não faz parte da base: fica fora de Object.keys/JSON.stringify.
    Object.defineProperty(core, "_format", { value: format, enumerable: false, writable: false });
    for (const [collection, items] of Object.entries(core.profiles || {})) {
      items.forEach((item) => applyAliases(item, format.aliases, collection, "core"));
    }
    return core;
  };

  // Mescla os textos de um grupo nos perfis do core (que passam a ter o
  // formato completo) e devolve, por coleção, os campos que vieram dele.
  const mergeDetails = (core, details) => {
    const format = formatOf(core);
    const resolved = {};
    for (const [collection, byId] of Object.entries(details)) {
      resolved[collection] = new Map();
      for (const item of core.profiles[collection] || []) {
        const before = new Set(Object.keys(item));
        Object.assign(item, byId[item.id] || {});
        applyAliases(item, format.aliases, collection, "details");
        const fields = {};
        for (const key of Object.keys(item)) {
          if (!before.has(key)) fields[key] = item[key];
        }
        resolved[collection].set(item.id, fields);
      }
    }
    return resolved;
  };

  const mergeQuiz = (core, quiz) => Object.assign(core, quiz);

  // ---- Navegador -------------------------------------------------------------
  let corePromise = null;
  let quizPromise = null;
  const groupPromises = new Map();
  const resolvedDetails = new Map();

  const fetchJson = async (path) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Catálogo indisponível (${response.status})`);
    return response.json();
  };

  const loadCore = () => {
    if (!corePromise) {
      corePromise = fetchJson(`${BASE_PATH}core.json`).then(hydrateCore);
      corePromise.catch(() => { corePromise = null; });
    }
    return corePromise;
  };

  const loadDetails = (group) => {
    if (!DETAIL_GROUPS[group]) return Promise.reject(new Error(`Grupo de catálogo desconhecido: ${group}`));
    if (!groupPromises.has(group)) {
      const promise = loadCore()
        .then(async (core) => {
          const details = await fetchJson(`${BASE_PATH}details-${group}.json`);
          for (const [collection, byId] of Object.entries(mergeDetails(core, details))) {
            resolvedDetails.set(collection, byId);
          }
          return core;
        });
      promise.catch(() => groupPromises.delete(group));
      groupPromises.set(group, promise);
    }
    return groupPromises.get(group);
  };

  const loadQuiz = () => {
    if (!quizPromise) {
      quizPromise = loadCore().then(async (core) => mergeQuiz(core, await fetchJson(`${BASE_PATH}quiz.json`)));
      quizPromise.catch(() => { quizPromise = null; });
    }
    return quizPromise;
  };

  // Base completa, no formato de political-catalog.json.
  const loadAll = async ({ quiz = false } = {}) => {
    await Promise.all([
      ...Object.keys(DETAIL_GROUPS).map(loadDetails),
      quiz ? loadQuiz() : null
    ]);
    return loadCore();
  };

  const isLoaded = (group) => DETAIL_GROUPS[group]
    ? DETAIL_GROUPS[group].every((collection) => resolvedDetails.has(collection))
    : false;

  // Campos de ficha já carregados de um perfil (para cópias de perfis, como os
  // valores com prefixo de id no catálogo de ideias).
  const detailsFor = (collection, id) => resolvedDetails.get(collection)?.get(id) || null;

  return {
    DETAIL_GROUPS,
    GROUP_BY_COLLECTION,
    applyAliases,
    hydrateCore,
    mergeDetails,
    mergeQuiz,
    loadCore,
    loadDetails,
    loadQuiz,
    loadAll,
    isLoaded,
    detailsFor
  };
});
