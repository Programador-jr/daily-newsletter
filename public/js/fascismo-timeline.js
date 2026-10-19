(() => {
  "use strict";

  const events = [
    {
      year: "1918–1919", title: "Derrota, revoluções e crise do pós-guerra",
      summary: "A guerra termina, impérios desmoronam e a ordem política europeia entra em crise.",
      detail: [
        "A Alemanha assinou o armistício em novembro de 1918. A derrota contribuiu para a queda da monarquia, a abdicação do kaiser e a formação de uma república. A jovem República de Weimar enfrentou disputas entre forças democráticas, conservadores, revolucionários de esquerda e grupos nacionalistas que rejeitavam a nova ordem.",
        "A Itália estava entre os vencedores, mas nacionalistas alegavam que o país não recebera todos os territórios que desejava. Inflação, desemprego, conflitos trabalhistas e medo de uma revolução alimentaram a polarização. Essas condições ajudam a explicar a crise, mas não tornavam o fascismo inevitável."
      ], period: "1918–1928"
    },
    {
      year: "1919", title: "Tratado de Versalhes e novos movimentos",
      summary: "O tratado de paz torna-se foco de ressentimento; Mussolini organiza seu movimento.",
      detail: [
        "O Tratado de Versalhes impôs à Alemanha perdas territoriais, limitações militares e reparações. Nacionalistas exploraram o ressentimento e difundiram a falsa ideia de que o país fora traído internamente. A república passou a ser associada injustamente à derrota por seus adversários.",
        "Em março de 1919, Benito Mussolini fundou os Fasci italiani di combattimento. O movimento ainda era pequeno e politicamente instável, mas articulava ultranacionalismo, violência de rua e hostilidade ao socialismo. O Partido dos Trabalhadores Alemães, que se tornaria o Partido Nazista, também surgiu nesse ambiente de nacionalismo radical."
      ], period: "1918–1928"
    },
    {
      year: "1919–1921", title: "Violência política e crescimento fascista",
      summary: "Esquadrões fascistas atacam sindicatos, cooperativas, sedes partidárias e adversários.",
      detail: [
        "Na Itália, grupos fascistas conhecidos como squadristi usaram espancamentos, incêndios e intimidação para enfraquecer organizações socialistas, sindicatos e administrações locais. Parte de proprietários rurais, empresários e setores conservadores apoiou ou tolerou essa violência por considerá-la uma barreira contra a esquerda.",
        "O movimento cresceu em meio ao conflito social do chamado Biennio Rosso, os anos de 1919 e 1920 de greves e ocupações. A violência fascista não foi apenas uma reação espontânea: tornou-se instrumento organizado de conquista de poder e contou com tolerância de autoridades em diversas ocasiões."
      ], period: "1918–1928"
    },
    {
      year: "1922", title: "A Marcha sobre Roma",
      summary: "A pressão fascista leva o rei a nomear Mussolini primeiro-ministro.",
      detail: [
        "Em outubro de 1922, milhares de fascistas mobilizaram-se na chamada Marcha sobre Roma. O governo pediu medidas para conter a ação, mas o rei Vítor Emanuel III recusou assinar a declaração de estado de sítio e convidou Mussolini a formar um governo.",
        "A nomeação ocorreu dentro das instituições monárquicas, sob ameaça de violência política. Mussolini ainda precisou consolidar seu domínio: a ditadura não estava plenamente estabelecida no dia da marcha. A decisão do rei e a colaboração de elites políticas foram fundamentais para a entrada dos fascistas no governo."
      ], period: "1918–1928"
    },
    {
      year: "1923–1924", title: "Golpe fracassado na Alemanha e crise na Itália",
      summary: "Hitler tenta tomar o poder pela força; o assassinato de Matteotti abala o regime italiano.",
      detail: [
        "Em novembro de 1923, Adolf Hitler e aliados tentaram um golpe em Munique, que foi derrotado pelas autoridades. Hitler foi preso e, durante o julgamento e a prisão, ganhou notoriedade nacionalista. Depois de libertado, o movimento reorganizou-se para buscar o poder por meios eleitorais e pela pressão das ruas.",
        "Na Itália, o deputado socialista Giacomo Matteotti denunciou a violência e as irregularidades das eleições de 1924. Foi sequestrado e assassinado por fascistas. A crise expôs o caráter violento do regime, mas Mussolini sobreviveu politicamente e usou os meses seguintes para aprofundar a repressão."
      ], period: "1918–1928"
    },
    {
      year: "1925–1928", title: "Consolidação da ditadura fascista",
      summary: "Mussolini restringe a oposição enquanto os nazistas reorganizam o partido.",
      detail: [
        "Entre 1925 e 1926, o governo italiano aprovou medidas que restringiram a imprensa, eliminaram a competição partidária e ampliaram os poderes do chefe de governo. O regime perseguiu adversários, limitou sindicatos independentes e construiu um Estado ditatorial centrado no Partido Fascista e no culto a Mussolini.",
        "Na Alemanha, o Partido Nazista foi reorganizado após o fracasso do golpe de 1923. A propaganda, a organização territorial, as formações paramilitares e a liderança pessoal de Hitler ganharam importância. Apesar disso, o partido ainda não era dominante no país e sua ascensão dependeria de novas crises e de decisões de outros atores políticos."
      ], period: "1918–1928"
    },
    {
      year: "1929–1932", title: "A Grande Depressão transforma a política alemã",
      summary: "A crise mundial aumenta o desemprego e amplia o apoio a partidos extremistas.",
      detail: [
        "A quebra da Bolsa de Nova York em 1929 foi seguida por uma depressão mundial. A economia alemã, dependente de crédito externo, sofreu com falências, desemprego em massa e cortes. Governos instáveis recorreram a decretos de emergência, enfraquecendo a confiança no sistema parlamentar.",
        "Os nazistas ampliaram seu voto ao combinar propaganda, nacionalismo, antissemitismo, promessas de recuperação e ataques à democracia. Ainda assim, não conquistaram maioria absoluta em eleições parlamentares livres. Hitler chegou à chancelaria em janeiro de 1933 por uma combinação de apoio eleitoral, negociações de bastidores e decisões de conservadores que acreditavam poder controlá-lo."
      ], period: "1929–1938"
    },
    {
      year: "1933", title: "Hitler chega à chancelaria e desmonta direitos",
      summary: "Em poucos meses, o governo nazista destrói as garantias centrais da democracia alemã.",
      detail: [
        "O presidente Paul von Hindenburg nomeou Hitler chanceler em 30 de janeiro de 1933. Após o incêndio do Reichstag, o governo usou o episódio para suspender liberdades civis, facilitar prisões políticas e perseguir comunistas e outros adversários.",
        "Em março, a Lei de Plenos Poderes foi aprovada sob intimidação e repressão, permitindo ao gabinete legislar sem o parlamento em condições que esvaziaram a Constituição. Sindicatos independentes foram dissolvidos, partidos rivais foram eliminados e a administração pública foi progressivamente submetida ao regime."
      ], period: "1929–1938"
    },
    {
      year: "1934", title: "O regime nazista concentra o poder",
      summary: "Expurgos internos e a morte de Hindenburg consolidam a posição de Hitler.",
      detail: [
        "Na chamada Noite das Facas Longas, em junho e julho de 1934, Hitler ordenou o assassinato de dirigentes das SA e de outros adversários reais ou percebidos. A operação buscou garantir apoio militar e neutralizar rivais; também demonstrou que o regime usava assassinatos extrajudiciais para consolidar o poder.",
        "Quando Hindenburg morreu em agosto de 1934, Hitler reuniu as funções de presidente e chanceler e passou a apresentar-se como Führer. As instituições restantes foram subordinadas à ditadura. A propaganda e o culto ao líder ajudaram a encobrir a coerção, a perseguição e a eliminação da oposição."
      ], period: "1929–1938"
    },
    {
      year: "1935–1938", title: "Racismo de Estado e expansão territorial",
      summary: "Leis antissemitas, anexações e violência organizada ampliam a perseguição.",
      detail: [
        "As Leis de Nuremberg de 1935 retiraram dos judeus direitos de cidadania e proibiram casamentos entre judeus e pessoas classificadas como de sangue alemão. A perseguição passou a ser institucionalizada por definições raciais, exclusão profissional, propaganda e discriminação legal.",
        "O regime também acelerou o rearmamento e a expansão territorial. A Alemanha anexou a Áustria em 1938 e, após o Acordo de Munique, ocupou os Sudetos; em novembro, a Kristallnacht marcou uma onda coordenada de ataques a judeus, sinagogas e estabelecimentos. A Itália fascista promulgou leis raciais antissemitas em 1938, aproximando ainda mais os dois regimes."
      ], period: "1929–1938"
    },
    {
      year: "1939", title: "Invasão da Polônia e início da guerra europeia",
      summary: "A Alemanha invade a Polônia; Reino Unido e França declaram guerra.",
      detail: [
        "Em 1º de setembro de 1939, a Alemanha invadiu a Polônia. A União Soviética invadiu pelo leste mais tarde naquele mês, conforme o protocolo secreto do pacto germano-soviético. Reino Unido e França declararam guerra à Alemanha, iniciando a guerra europeia.",
        "A ocupação trouxe execuções, expulsões, trabalho forçado e perseguição de poloneses e judeus. O conflito não foi apenas uma disputa militar: a ideologia racial nazista moldou a administração dos territórios ocupados e a violência contra populações consideradas inferiores ou inimigas."
      ], period: "1939–1945"
    },
    {
      year: "1941", title: "Invasão da União Soviética e assassinatos em massa",
      summary: "A guerra de extermínio no leste radicaliza a perseguição nazista.",
      detail: [
        "Em junho de 1941, a Alemanha lançou a Operação Barbarossa contra a União Soviética. A campanha foi concebida como guerra ideológica e racial, não apenas como confronto entre exércitos. Prisioneiros soviéticos foram submetidos à fome, ao abandono e a condições letais.",
        "Esquadrões móveis de extermínio, unidades policiais e colaboradores locais assassinaram comunidades judaicas inteiras por fuzilamentos em massa. A invasão acelerou a passagem da exclusão e deportação para o assassinato sistemático, embora o processo de genocídio tenha se desenvolvido por etapas e com diferentes métodos."
      ], period: "1939–1945"
    },
    {
      year: "1942–1945", title: "Holocausto, derrota nazista e libertação",
      summary: "O genocídio dos judeus europeus ocorre em escala continental; a Alemanha é derrotada.",
      detail: [
        "Durante o Holocausto, a Alemanha nazista e seus colaboradores assassinaram seis milhões de judeus europeus. Deportações em massa, guetos, fuzilamentos, fome, trabalho forçado e centros de extermínio integraram a perseguição genocida. O regime também perseguiu e matou milhões de outras pessoas, incluindo civis soviéticos e poloneses, pessoas com deficiência, roma e sinti, prisioneiros de guerra soviéticos e opositores políticos.",
        "A Alemanha se rendeu em maio de 1945, após a derrota militar e a ocupação de seu território pelos Aliados. A guerra na Europa terminou, mas os sobreviventes enfrentaram deslocamento, perdas familiares e traumas duradouros. Documentos, testemunhos e julgamentos posteriores ajudaram a registrar os crimes e a responsabilizar parte dos perpetradores."
      ], period: "1939–1945"
    }
  ];

  const timeline = document.getElementById("fascism-timeline");
  const filterContainer = document.getElementById("fascism-timeline-filters");
  const search = document.getElementById("fascism-timeline-search");
  const count = document.getElementById("timeline-count");
  const detail = document.getElementById("fascism-timeline-detail");
  if (!timeline || !filterContainer || !search || !count || !detail) return;

  let activePeriod = "all";
  let activeKey = "";
  let returnFocusYear = null;
  const periods = [
    { id: "all", label: "Todos" },
    { id: "1918–1928", label: "1918–1928" },
    { id: "1929–1938", label: "1929–1938" },
    { id: "1939–1945", label: "1939–1945" }
  ];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const filteredEvents = () => {
    const query = search.value.trim().toLocaleLowerCase("pt-BR");
    return events.filter(event => (activePeriod === "all" || event.period === activePeriod) &&
      (!query || [event.year, event.title, event.summary, ...event.detail].some(value => value.toLocaleLowerCase("pt-BR").includes(query))));
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
        '<span class="timeline-card"><small>Marco histórico ' + String(index + 1).padStart(2, "0") + '</small><strong>' + escapeHtml(event.title) + '</strong><span>' + escapeHtml(event.summary) + '</span><span class="timeline-more">Ver contexto histórico <i class="fas fa-arrow-right" aria-hidden="true"></i></span></span>' +
      '</button>'
    ).join("") : '<p class="timeline-no-results">Nenhum acontecimento corresponde à busca. Tente outro termo ou período.</p>';
    timeline.className = "timeline mode-globe";
  }

  function closeDetail() {
    detail.classList.remove("open");
    detail.innerHTML = "";
    document.body.classList.remove("history-detail-open");
    const trigger = returnFocusYear && timeline.querySelector('[data-event-year="' + CSS.escape(returnFocusYear) + '"]');
    if (trigger) trigger.focus();
    returnFocusYear = null;
  }

  function openDetail(event) {
    activeKey = event.year;
    renderTimeline();
    detail.innerHTML = '<div class="history-detail-backdrop" data-close-detail aria-hidden="true"></div>' +
      '<article class="history-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="fascism-detail-title">' +
      '<header class="history-accordion-header"><div><span class="detail-kicker">Marco histórico · ' + escapeHtml(event.year) + '</span><h2 id="fascism-detail-title">' + escapeHtml(event.title) + '</h2><span class="detail-years">' + escapeHtml(event.year) + '</span></div><button class="accordion-close" type="button" aria-label="Fechar detalhes"><i class="fas fa-times" aria-hidden="true"></i></button></header>' +
      '<div class="history-accordion-lead"><p>' + escapeHtml(event.summary) + '</p></div><div class="fascism-event-content">' + event.detail.map(paragraph => '<p>' + escapeHtml(paragraph) + '</p>').join('') + '</div></article>';
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
    if (entry) {
      returnFocusYear = entry.year;
      openDetail(entry);
    }
  });
  detail.addEventListener("click", event => {
    if (event.target.closest("[data-close-detail]") || event.target.closest(".accordion-close")) closeDetail();
  });
  document.addEventListener("keydown", event => {
    if (!detail.classList.contains("open")) return;
    if (event.key === "Escape") {
      closeDetail();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = detail.querySelector(".history-detail-dialog");
    const focusable = dialog ? Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')) : [];
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  search.addEventListener("input", renderTimeline);
  renderFilters();
  renderTimeline();
})();
