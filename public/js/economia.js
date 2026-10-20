(() => {
  const container = document.getElementById('economy-news');
  const text = value => typeof value === 'string' ? value.trim() : '';
  const safeExternalUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };
  const formatDate = value => {
    const raw = text(value);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    const date = new Date(raw);
    return raw && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date) : '';
  };
  const showMessage = message => {
    if (!container) return;
    const state = element('p', 'economy-state', message);
    state.setAttribute('role', 'status');
    container.replaceChildren(state);
    container.setAttribute('aria-busy', 'false');
  };
  const economyTerms = /economia|econômic|mercado|investimento|investimentos|inflação|ipca|selic|juros|banco central|copom|dólar|câmbio|pib|emprego|desemprego|salário|fiscal|dívida pública|contas públicas|tesouro|bolsa de valores|ações|exportação|importação|comércio exterior|petróleo|combustível|preço dos alimentos/i;
  const renderStory = story => {
    const card = element('article', 'economy-news-card'), content = element('div'), meta = element('div', 'economy-news-meta');
    const category = text(story.category), source = text(story.source), date = formatDate(story.publishedAt);
    if (category) meta.append(element('span', 'economy-news-category', category));
    if (source) meta.append(element('span', '', source));
    if (date) meta.append(element('time', '', date));
    content.append(meta, element('h3', '', text(story.title) || 'Notícia sem título'));
    if (text(story.summary)) content.append(element('p', '', text(story.summary)));
    if (text(story.context)) content.append(element('p', '', text(story.context)));
    card.append(content);
    const url = safeExternalUrl(text(story.url));
    if (url) { const link = element('a', '', 'Ler na fonte '); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; const icon = document.createElement('i'); icon.className = 'fas fa-arrow-up-right-from-square'; icon.setAttribute('aria-hidden', 'true'); link.append(icon); card.append(link); }
    return card;
  };
  if (container) fetch('/api/news', { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('Falha ao consultar a edição atual.'); return response.json(); })
    .then(data => {
      const stories = Array.isArray(data?.stories) ? data.stories : [];
      const filtered = stories.filter(story => economyTerms.test(text(story.category)) || economyTerms.test([story.title, story.summary, story.context].map(text).join(' ')))
        .filter(story => text(story.title) && text(story.source) && safeExternalUrl(text(story.url)));
      if (!filtered.length) { showMessage('Ainda não há notícias econômicas disponíveis na edição atual. Consulte os indicadores nas fontes oficiais acima ou veja a edição completa.'); return; }
      container.replaceChildren(...filtered.slice(0, 6).map(renderStory)); container.setAttribute('aria-busy', 'false');
    }).catch(() => showMessage('Não foi possível carregar as notícias econômicas agora. Os links para as fontes oficiais continuam disponíveis acima.'));

  const fetchJson = async (url, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  };
  const numberFormat = (value, digits = 2) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const dateFormat = value => { const parts = String(value || '').split('/'); return parts.length === 3 ? parts.join('/') : value; };
  const loadSeries = async (code, id, unit, digits = 2) => {
    const valueEl = document.getElementById('indicator-' + id + '-value');
    const periodEl = document.getElementById('indicator-' + id + '-period');
    try {
      const rows = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados/ultimos/1?formato=json');
      if (!Array.isArray(rows) || !rows.length || !Number.isFinite(Number(rows[0].valor))) throw new Error('Série sem observação');
      valueEl.textContent = numberFormat(Number(rows[0].valor), digits) + unit;
      periodEl.textContent = 'Observação de ' + dateFormat(rows[0].data) + ' · Banco Central';
      valueEl.dataset.loaded = 'true';
      return true;
    } catch {
      if (valueEl) valueEl.textContent = 'Indisponível';
      if (periodEl) periodEl.textContent = 'Falha na consulta · tente novamente';
      return false;
    }
  };
  const loadIbgeSeries = async (table, variable, id, unit, sourceLabel, digits = 2) => {
    const valueEl = document.getElementById('indicator-' + id + '-value');
    const periodEl = document.getElementById('indicator-' + id + '-period');
    try {
      const classification = table === '5932' ? '/c11255/90707' : '';
      const url = 'https://apisidra.ibge.gov.br/values/t/' + table + '/n1/1/v/' + variable + '/p/last%201' + classification;
      let rows;
      try {
        rows = await fetchJson(url);
      } catch (primaryError) {
        // Fallback oficial da API SIDRA v3; evita deixar a métrica sem alternativa quando a rota legada falha.
        const fallbackUrl = 'https://servicodados.ibge.gov.br/api/v3/agregados/' + table + '/periodos/-1/variaveis/' + variable + '?localidades=N1[all]' + (table === '5932' ? '&classificacao=11255[90707]' : '');
        const fallback = await fetchJson(fallbackUrl);
        const series = fallback?.[0]?.resultados?.[0]?.series?.[0]?.serie;
        const periods = series && typeof series === 'object' ? Object.keys(series).sort() : [];
        const lastPeriod = periods.at(-1);
        if (!lastPeriod || !Number.isFinite(Number(String(series[lastPeriod]).replace(',', '.')))) throw primaryError;
        valueEl.textContent = numberFormat(Number(String(series[lastPeriod]).replace(',', '.')), digits) + unit;
        periodEl.textContent = lastPeriod + ' · ' + sourceLabel + ' (SIDRA API v3)';
        valueEl.dataset.loaded = 'true';
        return true;
      }
      const latest = Array.isArray(rows) ? rows.slice(1).reverse().find(row => row.V && row.V !== '...') : null;
      if (!latest || !Number.isFinite(Number(String(latest.V).replace(',', '.')))) throw new Error('Série sem observação');
      valueEl.textContent = numberFormat(Number(String(latest.V).replace(',', '.')), digits) + unit;
      periodEl.textContent = (latest.D3N || latest.D2N || latest.D1N || 'Último período disponível') + ' · ' + sourceLabel;
      valueEl.dataset.loaded = 'true';
      return true;
    } catch {
      if (valueEl) valueEl.textContent = 'Indisponível';
      if (periodEl) periodEl.textContent = 'Falha na consulta · tente novamente';
      return false;
    }
  };
  const indicatorLoads = [
    loadSeries('432', 'selic', '% a.a.', 2),
    loadSeries('13522', 'ipca', '%', 2),
    loadSeries('5793', 'primario', '% do PIB', 2),
    loadSeries('13762', 'divida', '% do PIB', 2),
    loadIbgeSeries('1737', '63', 'ipca-mensal', '%', 'IBGE · IPCA'),
    loadIbgeSeries('5932', '6564', 'pib', '%', 'IBGE · PIB trimestral')
  ];
  Promise.allSettled(indicatorLoads).then(results => {
    const status = document.getElementById('economy-indicators-updated');
    const successful = results.filter(result => result.status === 'fulfilled' && result.value === true).length;
    if (status) status.textContent = successful === indicatorLoads.length
      ? 'Todas as séries foram carregadas. Os cartões exibem a data de cada observação oficial.'
      : successful > 0
        ? successful + ' de ' + indicatorLoads.length + ' séries carregadas. As demais estão indisponíveis no momento; cada cartão informa seu estado.'
        : 'Não foi possível consultar as séries agora. Use os links oficiais nos detalhes ou tente novamente mais tarde.';
  });


  const priceItems = [
    { id: 'rice', label: 'arroz' },
    { id: 'milk', label: 'leite' },
    { id: 'oil', label: 'óleo' }
  ];
  const updatePriceLab = () => {
    let beforeTotal = 0, nowTotal = 0;
    priceItems.forEach(item => {
      const beforeInput = document.getElementById('price-' + item.id + '-before');
      const nowInput = document.getElementById('price-' + item.id + '-now');
      const changeEl = document.getElementById('price-' + item.id + '-change');
      const before = Math.max(0, Number(beforeInput?.value) || 0);
      const now = Math.max(0, Number(nowInput?.value) || 0);
      beforeTotal += before; nowTotal += now;
      const difference = before === 0 ? null : ((now - before) / before) * 100;
      if (changeEl) changeEl.textContent = difference === null ? 'Informe o preço anterior' : (difference > 0 ? '+' : '') + numberFormat(difference, 1) + '%';
    });
    const totalDifference = beforeTotal === 0 ? null : ((nowTotal - beforeTotal) / beforeTotal) * 100;
    const beforeEl = document.getElementById('price-total-before');
    const nowEl = document.getElementById('price-total-now');
    const changeEl = document.getElementById('price-total-change');
    if (beforeEl) beforeEl.textContent = money(beforeTotal);
    if (nowEl) nowEl.textContent = money(nowTotal);
    if (changeEl) changeEl.textContent = totalDifference === null ? 'Informe os preços anteriores' : (totalDifference > 0 ? '+' : '') + numberFormat(totalDifference, 1) + '%';
  };
  document.querySelectorAll('.economy-price-input').forEach(input => input.addEventListener('input', updatePriceLab));
  updatePriceLab();

  const flowDetails = {
    revenue: { title: 'Arrecadação', body: 'O governo obtém recursos por tributos, contribuições, exploração de patrimônio e outras receitas. A origem e a destinação legal variam conforme o tipo de receita.' },
    spending: { title: 'Despesas públicas', body: 'As despesas financiam serviços, políticas públicas, investimentos e funcionamento do Estado. A execução depende do orçamento aprovado, das regras legais e da disponibilidade financeira.' },
    primary: { title: 'Resultado primário', body: 'É a diferença entre receitas e despesas primárias, sem contar os juros nominais da dívida. Superávit significa receitas primárias maiores que despesas primárias; déficit significa o contrário.' },
    debt: { title: 'Dívida pública e juros', body: 'A dívida representa obrigações acumuladas. Sua trajetória depende, entre outros fatores, do resultado fiscal, dos juros, do crescimento da economia, da inflação e de ajustes patrimoniais.' }
  };
  const flowDetail = document.getElementById('economy-flow-detail');
  document.querySelectorAll('[data-flow]').forEach(button => button.addEventListener('click', () => {
    const detail = flowDetails[button.dataset.flow];
    if (!detail || !flowDetail) return;
    document.querySelectorAll('[data-flow]').forEach(step => {
      const active = step === button;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', String(active));
    });
    const heading = document.createElement('h4');
    heading.textContent = detail.title;
    const paragraph = document.createElement('p');
    paragraph.textContent = detail.body;
    flowDetail.replaceChildren(heading, paragraph);
  }));

  const chartSvg = document.getElementById('economy-history-chart');
  const chartStatus = document.getElementById('economy-chart-status');
  const chartNames = {
    '432': { title: 'Meta Selic', unit: '% ao ano', source: 'Banco Central · SGS 432' },
    '13522': { title: 'IPCA acumulado em 12 meses', unit: '%', source: 'Banco Central · SGS 13522' }
  };
  const renderHistoryChart = (rows, code) => {
    if (!chartSvg || !rows.length) return;
    const width = 720, height = 300, left = 58, right = 24, top = 24, bottom = 46;
    const values = rows.map(row => Number(String(row.valor).replace(',', '.')));
    const base = values[0];
    const indexed = values.map(value => base === 0 ? value : value / base * 100);
    let min = Math.min(...indexed), max = Math.max(...indexed);
    if (min === max) { min -= 1; max += 1; }
    const pad = (max - min) * .12;
    min -= pad; max += pad;
    const x = i => left + i * (width - left - right) / Math.max(1, rows.length - 1);
    const y = value => top + (max - value) * (height - top - bottom) / (max - min);
    const ns = 'http://www.w3.org/2000/svg';
    const make = (tag, attrs, content) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
      if (content !== undefined) node.textContent = content;
      return node;
    };
    const children = [];
    for (let tick = 0; tick < 5; tick++) {
      const value = min + (max - min) * tick / 4, yy = y(value);
      children.push(make('line', { x1: left, y1: yy, x2: width - right, y2: yy, class: 'economy-chart-gridline' }));
      children.push(make('text', { x: left - 10, y: yy + 4, 'text-anchor': 'end', class: 'economy-chart-label' }, numberFormat(value, 0)));
    }
    const points = indexed.map((value, i) => x(i) + ',' + y(value)).join(' ');
    children.push(make('polyline', { points, class: 'economy-chart-line' }));
    [0, Math.floor((rows.length - 1) / 2), rows.length - 1].filter((value, index, array) => array.indexOf(value) === index).forEach(i => {
      children.push(make('text', { x: x(i), y: height - 16, 'text-anchor': i === 0 ? 'start' : i === rows.length - 1 ? 'end' : 'middle', class: 'economy-chart-label' }, rows[i].data));
    });
    children.push(make('text', { x: left, y: 14, class: 'economy-chart-label' }, 'Índice (primeira observação = 100)'));
    chartSvg.replaceChildren(...children);
    chartSvg.setAttribute('aria-label', 'Trajetória indexada de ' + chartNames[code].title + ', primeira observação igual a 100');
  };
  const loadHistoryChart = async () => {
    if (!chartSvg || !chartStatus) return;
    const code = document.getElementById('economy-series-select')?.value || '432';
    const count = Number(document.getElementById('economy-series-count')?.value || 24);
    chartStatus.textContent = 'Consultando a série oficial…';
    const loadButton = document.getElementById('economy-chart-load');
    if (loadButton) loadButton.disabled = true;
    try {
      const payload = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados/ultimos/' + count + '?formato=json');
      const rows = Array.isArray(payload) ? payload.slice().filter(row => Number.isFinite(Number(String(row.valor).replace(',', '.')))) : [];
      if (rows.length < 2) throw new Error('Poucas observações disponíveis');
      renderHistoryChart(rows, code);
      chartStatus.textContent = chartNames[code].title + ': ' + rows.length + ' observações carregadas. A linha mostra a variação relativa desde a primeira observação exibida.';
      const caption = document.getElementById('economy-chart-caption');
      if (caption) caption.textContent = 'Fonte: ' + chartNames[code].source + '. Valores oficiais em ' + chartNames[code].unit + '; gráfico reindexado para a primeira observação = 100. A frequência depende da série.';
    } catch {
      chartStatus.textContent = 'A série não respondeu dentro do prazo ou está indisponível. Tente novamente ou consulte o Banco Central do Brasil.';
      chartSvg.replaceChildren();
      const message = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      message.setAttribute('x', '360'); message.setAttribute('y', '150'); message.setAttribute('text-anchor', 'middle');
      message.textContent = 'Dados temporariamente indisponíveis';
      chartSvg.append(message);
    } finally {
      if (loadButton) loadButton.disabled = false;
    }
  };
  document.getElementById('economy-chart-load')?.addEventListener('click', loadHistoryChart);
  document.getElementById('economy-series-select')?.addEventListener('change', loadHistoryChart);
  document.getElementById('economy-series-count')?.addEventListener('change', loadHistoryChart);
  loadHistoryChart();

  const modal = document.getElementById('economy-modal');
  let modalReturnFocus = null;
  let modalScrollY = 0;
  const modalContent = {
    selic: { title: 'Taxa Selic', source: 'https://www.bcb.gov.br/controleinflacao/taxaselic', body: '<p>A Selic é a taxa básica de juros da economia, definida pelo Comitê de Política Monetária (Copom). Ela influencia o custo do crédito, as decisões de consumo e investimento e o retorno de aplicações de renda fixa.</p><p><strong>Como interpretar:</strong> elevações tendem a encarecer o crédito e reduzir pressões de demanda ao longo do tempo; cortes podem estimular a atividade. O efeito não é imediato e as taxas bancárias também dependem de risco, prazo, custos e concorrência.</p><p><strong>O número do cartão:</strong> é a meta Selic anualizada publicada na série 432 do Banco Central, não a taxa de todo empréstimo ou investimento.</p>' },
    ipca: { title: 'IPCA acumulado em 12 meses', source: 'https://www.ibge.gov.br/explica/inflacao.php', body: '<p>O IPCA é calculado pelo IBGE e mede a variação de preços de uma cesta de consumo. O acumulado em 12 meses compara o nível de preços com o mesmo período do ano anterior.</p><p><strong>Inflação menor não significa necessariamente preços menores.</strong> Se o índice passa de 6% para 4%, os preços em média continuam subindo, mas em ritmo mais lento.</p><p><strong>O número do cartão:</strong> é a série de variação acumulada em 12 meses do Banco Central (SGS 13522), baseada no IPCA.</p>' },
    'ipca-mensal': { title: 'IPCA do último mês', source: 'https://sidra.ibge.gov.br/tabela/1737', body: '<p>O IPCA mensal mostra quanto, em média, os preços da cesta de consumo variaram de um mês para o seguinte.</p><p><strong>Exemplo:</strong> se a variação mensal for 0,4%, uma cesta que custava R$ 500 custaria cerca de R$ 502, mantendo-se os mesmos itens e quantidades.</p><p>O resultado mensal não deve ser confundido com a inflação acumulada em 12 meses. Fonte: IBGE, tabela SIDRA 1737, variável 63.</p>' },
    pib: { title: 'Crescimento do PIB', source: 'https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9300-contas-nacionais-trimestrais.html', body: '<p>O Produto Interno Bruto (PIB) representa o valor dos bens e serviços finais produzidos no país. A taxa mostrada compara o volume do PIB com o trimestre imediatamente anterior, com ajuste sazonal.</p><p><strong>Como interpretar:</strong> crescimento positivo indica expansão em relação ao trimestre anterior; queda indica contração. O PIB pode crescer sem que a renda de todas as famílias aumente na mesma proporção.</p><p>Fonte: IBGE, Contas Nacionais Trimestrais, tabela SIDRA 5932, variável 6564.</p>' },
    primario: { title: 'Resultado primário', source: 'https://www.bcb.gov.br/estatisticas/estatisticasfiscais', body: '<p>É a diferença entre receitas e despesas primárias do setor público, sem incluir os juros nominais da dívida. O indicador mostrado é o fluxo acumulado em 12 meses para o setor público consolidado, em percentual do PIB.</p><p><strong>Leitura do sinal:</strong> valor positivo representa superávit primário; valor negativo representa déficit primário. Isso não mostra, sozinho, o resultado nominal nem toda a variação da dívida.</p><p>Fonte: série SGS 5793 do Banco Central. Verifique a metodologia e o período de referência da divulgação.</p>' },
    divida: { title: 'Dívida bruta do governo geral', source: 'https://www.bcb.gov.br/estatisticas/estatisticasfiscais', body: '<p>A Dívida Bruta do Governo Geral (DBGG) mede obrigações do Governo Federal, estados e municípios segundo a metodologia do Banco Central. A razão dívida/PIB compara o estoque de obrigações com o tamanho anual da economia.</p><p><strong>Como interpretar:</strong> observe a trajetória ao longo do tempo, os juros, o crescimento nominal do PIB, os resultados fiscais, as emissões e outros ajustes. A variação mensal não é explicada por um único fator.</p><p>Fonte: série SGS 13762, metodologia usada desde 2008.</p>' },
    arcabouco: { title: 'Arcabouço fiscal: as regras em conjunto', source: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp200.htm', body: '<p>A Lei Complementar nº 200/2023 instituiu o regime fiscal sustentável para as contas da União. O desenho combina metas de resultado primário com limites para o crescimento real das despesas primárias.</p><ul><li><strong>Faixa de crescimento:</strong> em regra, o limite de despesa cresce entre 0,6% e 2,5% acima da inflação.</li><li><strong>Receita como referência:</strong> o limite considera uma proporção da variação real da receita — em geral 70% quando a meta fiscal é cumprida e 50% quando não é, respeitados os critérios legais.</li><li><strong>Piso e teto:</strong> o cálculo também está sujeito ao piso e ao teto legais; por isso, aplicar apenas a multiplicação pode não reproduzir o limite oficial.</li><li><strong>Meta fiscal:</strong> mede o resultado primário e não deve ser confundida com o limite de despesa. A dívida também depende de juros, crescimento, receitas, despesas e outros fatores.</li></ul><p>O simulador desta página é ilustrativo. Não substitui o cálculo oficial nem incorpora todas as exceções, ajustes e regras de transição.</p>' }
  };
  const lockModalPageScroll = () => {
    modalScrollY = window.scrollY;
    document.body.style.setProperty('--history-scroll-lock-top', '-' + modalScrollY + 'px');
    document.body.classList.add('history-modal-open');
  };
  const unlockModalPageScroll = () => {
    document.body.classList.remove('history-modal-open');
    document.body.style.removeProperty('--history-scroll-lock-top');
    window.scrollTo(0, modalScrollY);
  };
  const closeModal = () => {
    if (!modal?.classList.contains('open')) return;
    modal.classList.remove('open');
    unlockModalPageScroll();
    modal.innerHTML = '';
    modalReturnFocus?.focus();
    modalReturnFocus = null;
  };
  const openModal = (key, trigger) => {
    const item = modalContent[key];
    if (!item || !modal) return;
    modalReturnFocus = trigger;
    modal.innerHTML =
      '<div class="history-detail-backdrop" aria-hidden="true"></div>' +
      '<div class="history-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="economy-modal-title">' +
        '<div class="history-accordion-header">' +
          '<div><span class="detail-kicker">Guia de economia</span><h2 id="economy-modal-title">' + item.title + '</h2></div>' +
          '<button class="accordion-close" type="button" aria-label="Fechar explicação"><i class="fas fa-times" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="history-accordion-lead economy-modal-body">' + item.body + '</div>' +
        '<div class="economy-modal-footer"><a href="' + item.source + '" target="_blank" rel="noopener noreferrer">Consultar fonte oficial <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a><button type="button" class="cta-button economy-modal-done">Fechar</button></div>' +
      '</div>';
    lockModalPageScroll();
    modal.classList.add('open');
    modal.querySelector('.history-detail-backdrop')?.addEventListener('click', closeModal);
    modal.querySelector('.accordion-close')?.addEventListener('click', closeModal);
    modal.querySelector('.economy-modal-done')?.addEventListener('click', closeModal);
    modal.querySelector('.accordion-close')?.focus();
  };
  document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.modal, button)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });
  const clampNumber = (id, min, max, fallback) => {
    const input = document.getElementById(id), value = Number(input?.value);
    if (!input || !Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  };
  const updateBasket = () => {
    const value = clampNumber('basket-value', 0, 10000000, 200), rate = clampNumber('basket-inflation', -99, 1000, 5);
    const result = value * (1 + rate / 100);
    document.getElementById('basket-result').textContent = money(result);
    document.getElementById('basket-difference').textContent = (result >= value ? 'Variação: +' : 'Variação: ') + money(Math.abs(result - value)).replace('R$', 'R$ ');
  };
  const updateLoan = () => {
    const principal = clampNumber('loan-value', 1, 10000000, 5000), rate = clampNumber('loan-rate', 0, 100, 2) / 100, months = Math.round(clampNumber('loan-months', 1, 360, 12));
    const payment = rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
    document.getElementById('loan-result').textContent = money(payment);
    document.getElementById('loan-total').textContent = 'Total estimado: ' + money(payment * months);
    const interestEl = document.getElementById('loan-interest');
    if (interestEl) interestEl.textContent = 'Juros estimados: ' + money(Math.max(0, payment * months - principal));
  };
  const updateFiscal = () => {
    const growth = clampNumber('revenue-growth', -20, 20, 3), share = document.getElementById('fiscal-target')?.value === 'yes' ? .7 : .5;
    const raw = growth * share, result = Math.max(.6, Math.min(2.5, raw));
    document.getElementById('fiscal-result').textContent = numberFormat(result, 1) + '%';
    document.getElementById('fiscal-explanation').textContent = numberFormat(share * 100, 0) + '% de ' + numberFormat(growth, 1) + '% = ' + numberFormat(raw, 2) + ' p.p.; resultado ilustrativo limitado ao intervalo de 0,6% a 2,5%.';
  };
  ['basket-value', 'basket-inflation'].forEach(id => document.getElementById(id)?.addEventListener('input', updateBasket));
  ['loan-value', 'loan-rate', 'loan-months'].forEach(id => document.getElementById(id)?.addEventListener('input', updateLoan));
  ['revenue-growth', 'fiscal-target'].forEach(id => document.getElementById(id)?.addEventListener('input', updateFiscal));
  updateBasket(); updateLoan(); updateFiscal();
})();