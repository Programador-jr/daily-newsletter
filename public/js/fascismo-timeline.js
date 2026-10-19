(() => {
  "use strict";

  const events = [
    { year: "1918–1919", start: 1918, end: 1919, title: "Fim da guerra e instabilidade", summary: "Derrota alemã, nascimento da República de Weimar e tensões sociais na Itália.", detail: "A Alemanha foi derrotada na Primeira Guerra Mundial e passou por revolução e mudança de regime. A República de Weimar nasceu em meio a conflitos políticos. Na Itália, apesar de estar entre os vencedores, difundiu-se a ideia nacionalista de uma “vitória mutilada”, junto a conflitos trabalhistas e violência de grupos paramilitares.", period: "1918–1929" },
    { year: "1919", start: 1919, end: 1919, title: "Formação do movimento fascista", summary: "Mussolini funda os Fasci italiani di combattimento.", detail: "Benito Mussolini fundou os Fasci italiani di combattimento. O movimento combinou ultranacionalismo, hostilidade ao socialismo e ação violenta nas ruas. O Tratado de Versalhes e as disputas sobre a paz também se tornaram temas centrais da política alemã, explorados por nacionalistas e pelo Partido Nazista.", period: "1918–1929" },
    { year: "1922", start: 1922, end: 1922, title: "Mussolini chega ao governo", summary: "A Marcha sobre Roma pressiona a monarquia italiana.", detail: "A Marcha sobre Roma pressionou a monarquia italiana. O rei Vítor Emanuel III nomeou Mussolini primeiro-ministro. A ditadura não surgiu completa naquele dia: foi consolidada nos anos seguintes, com intimidação, restrições à oposição e destruição gradual da competição política.", period: "1918–1929" },
    { year: "1923–1928", start: 1923, end: 1928, title: "Tentativa de golpe e consolidação", summary: "O golpe de Munique fracassa; a repressão fascista se intensifica na Itália.", detail: "Na Alemanha, o golpe de Munique de 1923 fracassou e Hitler foi preso. Depois, os nazistas passaram a disputar eleições enquanto mantinham organização paramilitar e propaganda. Na Itália, leis e violência política reduziram a oposição, e o assassinato do deputado socialista Giacomo Matteotti em 1924 expôs a repressão do regime.", period: "1918–1929" },
    { year: "1929–1932", start: 1929, end: 1932, title: "A Grande Depressão", summary: "A crise econômica agrava o desemprego e fortalece o apoio aos nazistas.", detail: "A crise mundial provocou desemprego, falências e insegurança. Na Alemanha, a crise enfraqueceu a confiança nas instituições e aumentou o apoio eleitoral aos nazistas, mas o partido não obteve maioria absoluta em eleições livres nacionais. A nomeação de Hitler resultou também de negociações e decisões de conservadores que acreditavam poder controlá-lo.", period: "1918–1929" },
    { year: "1933–1934", start: 1933, end: 1934, title: "Destruição da democracia alemã", summary: "Hitler torna-se chanceler e o regime elimina direitos e partidos adversários.", detail: "Hitler foi nomeado chanceler em 30 de janeiro de 1933. Após o incêndio do Reichstag, o governo restringiu direitos civis; a Lei de Plenos Poderes, aprovada sob intimidação em março, permitiu governar sem o parlamento. Partidos e sindicatos independentes foram eliminados, e a ditadura se consolidou.", period: "1930–1938" },
    { year: "1935–1938", start: 1935, end: 1938, title: "Perseguição institucionalizada", summary: "Leis raciais e violência antissemita passam a integrar a política de Estado.", detail: "As Leis de Nuremberg de 1935 retiraram direitos dos judeus na Alemanha. Em novembro de 1938, a violência antissemita coordenada conhecida como Kristallnacht destruiu sinagogas e estabelecimentos, matou pessoas e levou milhares à prisão. A Itália fascista também adotou leis raciais antissemitas em 1938.", period: "1930–1938" },
    { year: "1939–1941", start: 1939, end: 1941, title: "Guerra de conquista e radicalização", summary: "A invasão da Polônia inicia a guerra na Europa; a violência nazista se amplia.", detail: "A Alemanha invadiu a Polônia em setembro de 1939, iniciando a guerra europeia. A ocupação nazista submeteu populações a deportações, trabalho forçado e violência. A invasão da União Soviética em 1941 foi acompanhada por assassinatos em massa, inclusive de comunidades judaicas.", period: "1939–1945" },
    { year: "1942–1945", start: 1942, end: 1945, title: "Holocausto, derrota e libertação", summary: "O assassinato sistemático de seis milhões de judeus europeus e a derrota nazista.", detail: "O regime nazista e seus colaboradores organizaram a deportação e o assassinato sistemático de seis milhões de judeus europeus no Holocausto. Também perseguiram e mataram milhões de outras vítimas. A Alemanha nazista foi derrotada em maio de 1945; a guerra na Europa terminou, deixando cidades destruídas, sobreviventes deslocados e crimes documentados em julgamentos posteriores.", period: "1939–1945" }
  ];

  const timeline = document.getElementById("fascism-timeline");
  const filterContainer = document.getElementById("fascism-timeline-filters");
  const search = document.getElementById("fascism-timeline-search");
  const count = document.getElementById("timeline-count");
  const detail = document.getElementById("fascism-timeline-detail");
  const viewButtons = [...document.querySelectorAll("[data-timeline-view]")];
  if (!timeline || !filterContainer || !search || !count || !detail) return;

  let activePeriod = "all";
  let activeKey = "";
  let activeView = "globe";
  const periods = [
    { id: "all", label: "Todos" },
    { id: "1918–1929", label: "1918–1929" },
    { id: "1930–1938", label: "1930–1938" },
    { id: "1939–1945", label: "1939–1945" }
  ];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const filteredEvents = () => {
    const query = search.value.trim().toLocaleLowerCase("pt-BR");
    return events.filter(event => (activePeriod === "all" || event.period === activePeriod) &&
      (!query || [event.year, event.title, event.summary, event.detail].some(value => value.toLocaleLowerCase("pt-BR").includes(query))));
  };

  function renderFilters() {
    filterContainer.innerHTML = periods.map(period =>
      '<button class="history-filter' + (activePeriod === period.id ? ' active' : '') + '" type="button" data-period="' + escapeHtml(period.id) + '" aria-pressed="' + (activePeriod === period.id) + '">' + escapeHtml(period.label) + '</button>'
    ).join("");
  }

  function renderTimeline() {
    const visible = filteredEvents();
    count.textContent = visible.length + (visible.length === 1 ? " acontecimento" : " acontecimentos");
    timeline.innerHTML = visible.length ? visible.map((event, index) =>
      '<button class="timeline-item' + (event.year === activeKey ? ' active is-center' : '') + '" type="button" data-event-year="' + escapeHtml(event.year) + '" aria-haspopup="dialog" aria-label="' + escapeHtml(event.year + ": " + event.title) + '">' +
        '<span class="timeline-year">' + escapeHtml(event.year) + '</span><span class="timeline-dot" aria-hidden="true"></span>' +
        '<span class="timeline-card"><small>Marco histórico ' + String(index + 1).padStart(2, "0") + '</small><strong>' + escapeHtml(event.title) + '</strong><span>' + escapeHtml(event.summary) + '</span></span>' +
      '</button>'
    ).join("") : '<p class="timeline-no-results">Nenhum acontecimento corresponde à busca. Tente outro termo ou período.</p>';
    timeline.className = "timeline mode-" + activeView;
    viewButtons.forEach(button => {
      const selected = button.dataset.timelineView === activeView;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function closeDetail() {
    detail.classList.remove("open");
    detail.innerHTML = "";
    document.body.classList.remove("history-detail-open");
  }

  function openDetail(event) {
    activeKey = event.year;
    renderTimeline();
    detail.innerHTML = '<div class="history-detail-backdrop" data-close-detail aria-hidden="true"></div>' +
      '<article class="history-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="fascism-detail-title">' +
      '<header class="history-accordion-header"><div><span class="detail-kicker">Marco histórico · ' + escapeHtml(event.year) + '</span><h2 id="fascism-detail-title">' + escapeHtml(event.title) + '</h2><span class="detail-years">' + escapeHtml(event.year) + '</span></div><button class="accordion-close" type="button" aria-label="Fechar detalhes"><i class="fas fa-times" aria-hidden="true"></i></button></header>' +
      '<div class="history-accordion-lead"><p>' + escapeHtml(event.summary) + '</p></div><div class="fascism-event-content"><p>' + escapeHtml(event.detail) + '</p></div></article>';
    detail.classList.add("open");
    document.body.classList.add("history-detail-open");
    detail.querySelector(".accordion-close").focus();
  }

  filterContainer.addEventListener("click", event => {
    const button = event.target.closest("[data-period]");
    if (!button) return;
    activePeriod = button.dataset.period;
    renderFilters();
    renderTimeline();
    closeDetail();
  });
  timeline.addEventListener("click", event => {
    const button = event.target.closest("[data-event-year]");
    if (!button) return;
    const entry = events.find(item => item.year === button.dataset.eventYear);
    if (entry) openDetail(entry);
  });
  detail.addEventListener("click", event => {
    if (event.target.closest("[data-close-detail]") || event.target.closest(".accordion-close")) closeDetail();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && detail.classList.contains("open")) closeDetail();
  });
  search.addEventListener("input", renderTimeline);
  viewButtons.forEach(button => button.addEventListener("click", () => {
    activeView = button.dataset.timelineView;
    renderTimeline();
  }));
  renderFilters();
  renderTimeline();
})();