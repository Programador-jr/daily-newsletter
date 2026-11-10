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
  const toNumber = value => Number(String(value).replace(',', '.'));
  const svgNs = 'http://www.w3.org/2000/svg';
  const svgNode = (tag, attrs) => {
    const node = document.createElementNS(svgNs, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  const parseSgsDate = value => {
    const parts = String(value || '').split('/');
    return parts.length === 3 ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])) : new Date(value);
  };
  const formatQueryDate = date => String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
  // Mantém a última observação de cada mês (séries diárias como a Meta Selic).
  const lastPerMonth = rows => {
    const monthly = new Map();
    rows.forEach(row => monthly.set(row.data.split('/').slice(1).reverse().join('-'), row));
    return [...monthly.values()];
  };

  // Valores mais recentes, reaproveitados pelos simuladores.
  const latest = {};
  const latestListeners = [];
  const onLatest = listener => latestListeners.push(listener);

  const renderSparkline = (svg, values) => {
    if (!svg) return;
    if (values.length < 2) { svg.replaceChildren(); return; }
    const width = 120, height = 34, pad = 3;
    let min = Math.min(...values), max = Math.max(...values);
    if (max === min) { max += 1; min -= 1; }
    const x = i => i * width / (values.length - 1);
    const y = value => pad + (max - value) * (height - pad * 2) / (max - min);
    const points = values.map((value, i) => x(i).toFixed(2) + ',' + y(value).toFixed(2)).join(' ');
    const children = [];
    if (min < 0 && max > 0) children.push(svgNode('line', { x1: 0, x2: width, y1: y(0), y2: y(0), class: 'economy-sparkline-zero' }));
    children.push(svgNode('polygon', { points: '0,' + height + ' ' + points + ' ' + width + ',' + height, class: 'economy-sparkline-area' }));
    children.push(svgNode('polyline', { points, class: 'economy-sparkline-line' }));
    svg.replaceChildren(...children);
  };

  const trendIcons = { up: 'fa-arrow-trend-up', down: 'fa-arrow-trend-down', flat: 'fa-equals' };
  const renderIndicator = (id, values, unit, digits, periodText, comparison) => {
    const valueEl = document.getElementById('indicator-' + id + '-value');
    const periodEl = document.getElementById('indicator-' + id + '-period');
    const trendEl = document.getElementById('indicator-' + id + '-trend');
    const current = values[values.length - 1];
    valueEl.textContent = numberFormat(current, digits) + unit;
    valueEl.dataset.loaded = 'true';
    periodEl.textContent = periodText;
    valueEl.closest('.economy-indicator')?.classList.add('is-loaded');
    if (trendEl && values.length >= 2) {
      const diff = current - values[values.length - 2];
      const direction = Math.abs(diff) < 0.005 ? 'flat' : diff > 0 ? 'up' : 'down';
      const label = direction === 'flat' ? 'estável' : (diff > 0 ? '+' : '') + numberFormat(diff, 2) + ' p.p.';
      const icon = document.createElement('i');
      icon.className = 'fas ' + trendIcons[direction];
      icon.setAttribute('aria-hidden', 'true');
      const sr = element('span', 'sr-only', 'Variação em relação ' + comparison + ': ');
      trendEl.replaceChildren(icon, sr, document.createTextNode(label));
      trendEl.dataset.direction = direction;
      trendEl.title = 'Variação em relação ' + comparison;
      trendEl.hidden = false;
    }
    renderSparkline(document.getElementById('indicator-' + id + '-spark'), values);
    latest[id] = current;
    latestListeners.forEach(listener => listener(id, current));
    return true;
  };
  const markUnavailable = id => {
    const valueEl = document.getElementById('indicator-' + id + '-value');
    const periodEl = document.getElementById('indicator-' + id + '-period');
    if (valueEl) valueEl.textContent = 'Indisponível';
    if (periodEl) periodEl.textContent = 'Falha na consulta · tente novamente';
    valueEl?.closest('.economy-indicator')?.classList.add('is-loaded', 'is-unavailable');
    return false;
  };

  const loadSeries = async (code, id, unit, digits = 2, { daily = false } = {}) => {
    try {
      let rows;
      if (daily) {
        const end = new Date();
        const start = new Date(end.getFullYear() - 1, end.getMonth() - 1, 1);
        const params = new URLSearchParams({ formato: 'json', dataInicial: formatQueryDate(start), dataFinal: formatQueryDate(end) });
        const payload = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados?' + params.toString());
        rows = Array.isArray(payload) ? lastPerMonth(payload.filter(row => row?.data && Number.isFinite(toNumber(row.valor))).sort((a, b) => parseSgsDate(a.data) - parseSgsDate(b.data))) : [];
      } else {
        const payload = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados/ultimos/13?formato=json');
        rows = Array.isArray(payload) ? payload.filter(row => Number.isFinite(toNumber(row.valor))) : [];
      }
      if (!rows.length) throw new Error('Série sem observação');
      const last = rows[rows.length - 1];
      return renderIndicator(id, rows.map(row => toNumber(row.valor)), unit, digits, 'Observação de ' + dateFormat(last.data) + ' · Banco Central', 'ao mês anterior');
    } catch {
      return markUnavailable(id);
    }
  };
  const loadIbgeSeries = async (table, variable, id, unit, sourceLabel, comparison, digits = 2) => {
    try {
      const classification = table === '5932' ? '/c11255/90707' : '';
      const url = 'https://apisidra.ibge.gov.br/values/t/' + table + '/n1/1/v/' + variable + '/p/last%208' + classification;
      try {
        const rows = await fetchJson(url);
        const valid = Array.isArray(rows) ? rows.slice(1).filter(row => row.V && row.V !== '...' && Number.isFinite(toNumber(row.V))) : [];
        if (!valid.length) throw new Error('Série sem observação');
        const last = valid[valid.length - 1];
        return renderIndicator(id, valid.map(row => toNumber(row.V)), unit, digits, (last.D3N || last.D2N || last.D1N || 'Último período disponível') + ' · ' + sourceLabel, comparison);
      } catch (primaryError) {
        // Fallback oficial da API SIDRA v3; evita deixar a métrica sem alternativa quando a rota legada falha.
        const fallbackUrl = 'https://servicodados.ibge.gov.br/api/v3/agregados/' + table + '/periodos/-8/variaveis/' + variable + '?localidades=N1[all]' + (table === '5932' ? '&classificacao=11255[90707]' : '');
        const fallback = await fetchJson(fallbackUrl);
        const series = fallback?.[0]?.resultados?.[0]?.series?.[0]?.serie;
        const periods = series && typeof series === 'object' ? Object.keys(series).sort().filter(period => Number.isFinite(toNumber(series[period]))) : [];
        if (!periods.length) throw primaryError;
        return renderIndicator(id, periods.map(period => toNumber(series[period])), unit, digits, periods.at(-1) + ' · ' + sourceLabel + ' (SIDRA API v3)', comparison);
      }
    } catch {
      return markUnavailable(id);
    }
  };
  const loadIpcaTwelveMonthSeries = async () => {
    try {
      const payload = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/13?formato=json');
      const rows = Array.isArray(payload) ? payload.filter(row => Number.isFinite(toNumber(row.valor))) : [];
      if (!rows.length) throw new Error('Série sem observação');
      return renderIndicator('ipca', rows.map(row => toNumber(row.valor)), '%', 2, 'Observação de ' + dateFormat(rows.at(-1).data) + ' · Banco Central', 'ao mês anterior');
    } catch { /* tenta calcular a partir do IPCA mensal do IBGE */ }
    try {
      let observations;
      try {
        const rows = await fetchJson('https://apisidra.ibge.gov.br/values/t/1737/n1/1/v/63/p/last%2012');
        observations = Array.isArray(rows) ? rows.slice(1).filter(row => Number.isFinite(toNumber(row.V))) : [];
      } catch {
        const data = await fetchJson('https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/-12/variaveis/63?localidades=N1[all]');
        const series = data?.[0]?.resultados?.[0]?.series?.[0]?.serie;
        observations = series && typeof series === 'object'
          ? Object.keys(series).sort().map(period => ({ period, value: series[period] })).filter(row => Number.isFinite(toNumber(row.value)))
          : [];
      }
      if (observations.length < 12) throw new Error('Série mensal do IPCA incompleta');
      const last = observations[observations.length - 1];
      const inflation = (observations.slice(-12).reduce((factor, row) => factor * (1 + toNumber(row.V ?? row.value) / 100), 1) - 1) * 100;
      if (!Number.isFinite(inflation)) throw new Error('Série mensal do IPCA inválida');
      return renderIndicator('ipca', [inflation], '%', 2, (last.D3N || last.period || 'Últimos 12 meses') + ' · IBGE · acumulado em 12 meses', 'ao mês anterior');
    } catch {
      return markUnavailable('ipca');
    }
  };
  const indicatorLoads = [
    loadSeries('432', 'selic', '% a.a.', 2, { daily: true }),
    loadIpcaTwelveMonthSeries(),
    loadSeries('5793', 'primario', '% do PIB', 2),
    loadSeries('13762', 'divida', '% do PIB', 2),
    loadIbgeSeries('1737', '63', 'ipca-mensal', '%', 'IBGE · IPCA', 'ao mês anterior'),
    loadIbgeSeries('5932', '6564', 'pib', '%', 'IBGE · PIB trimestral', 'ao trimestre anterior')
  ];
  Promise.allSettled(indicatorLoads).then(results => {
    const status = document.getElementById('economy-indicators-updated');
    const successful = results.filter(result => result.status === 'fulfilled' && result.value === true).length;
    if (status) status.textContent = successful === indicatorLoads.length
      ? 'Todas as séries foram carregadas. Os cartões exibem a data de cada observação oficial; a seta compara com a observação anterior e a linha mostra os últimos meses.'
      : successful > 0
        ? successful + ' de ' + indicatorLoads.length + ' séries carregadas. As demais estão indisponíveis no momento; cada cartão informa seu estado.'
        : 'Não foi possível consultar as séries agora. Use os links oficiais nos detalhes ou tente novamente mais tarde.';
  });

  /* ------------------------------------------------ controles deslizantes */

  // Cada <input type="range" data-sync="id"> espelha o campo numérico correspondente.
  document.querySelectorAll('input[type="range"][data-sync]').forEach(range => {
    const target = document.getElementById(range.dataset.sync);
    if (!target) return;
    const paint = () => {
      const min = Number(range.min), max = Number(range.max);
      range.style.setProperty('--fill', ((Number(range.value) - min) / (max - min) * 100) + '%');
    };
    range.addEventListener('input', () => {
      target.value = range.value;
      target.dataset.userEdited = 'true';
      target.dispatchEvent(new Event('input', { bubbles: true }));
      paint();
    });
    target.addEventListener('input', () => {
      if (target.value !== '' && Number.isFinite(Number(target.value))) range.value = target.value;
      paint();
    });
    target.addEventListener('change', () => { target.dataset.userEdited = 'true'; });
    paint();
  });
  // Preenche um campo com dado oficial apenas se a pessoa ainda não o alterou.
  const presetField = (id, value) => {
    const input = document.getElementById(id);
    if (!input || input.dataset.userEdited || !Number.isFinite(value)) return;
    input.value = String(Math.round(value * 100) / 100);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  /* ---------------------------------------------- inflação no seu bolso */

  const priceRows = document.getElementById('price-lab-rows');
  const priceBars = document.getElementById('price-lab-bars');
  const pricePresets = {
    feira: [['Arroz (5 kg)', 25, 29], ['Feijão (1 kg)', 7.5, 8.9], ['Café (500 g)', 16, 24], ['Banana (1 kg)', 5.5, 6.2]],
    casa: [['Conta de luz', 180, 205], ['Água e esgoto', 90, 98], ['Gás de cozinha (13 kg)', 105, 112], ['Internet', 99.9, 109.9]],
    transporte: [['Gasolina (1 L)', 5.6, 6.2], ['Passagem de ônibus', 4.4, 5], ['Estacionamento (hora)', 12, 15]]
  };
  let priceRowCount = 0;
  const priceInput = (attrs) => Object.assign(document.createElement('input'), attrs);
  const createPriceRow = (name, before, now) => {
    const index = ++priceRowCount;
    const tr = document.createElement('tr');
    tr.dataset.priceRow = '';
    const cells = [
      ['th', priceInput({ id: 'price-item-' + index + '-name', className: 'economy-price-name', type: 'text', maxLength: 40, value: name, placeholder: 'Nome do item' }), 'Nome do produto'],
      ['td', priceInput({ id: 'price-item-' + index + '-before', className: 'economy-price-input', type: 'number', min: 0, max: 100000, step: 0.01, value: before, inputMode: 'decimal' }), 'Preço anterior'],
      ['td', priceInput({ id: 'price-item-' + index + '-now', className: 'economy-price-input', type: 'number', min: 0, max: 100000, step: 0.01, value: now, inputMode: 'decimal' }), 'Preço atual']
    ];
    cells.forEach(([tag, input, label], position) => {
      const cell = document.createElement(tag);
      if (tag === 'th') cell.scope = 'row';
      if (position) cell.dataset.label = position === 1 ? 'Antes (R$)' : 'Agora (R$)';
      if (position === 1) input.dataset.price = 'before';
      if (position === 2) input.dataset.price = 'now';
      const labelEl = element('label', 'sr-only', label + (position ? ' de ' + (name || 'item') : ''));
      labelEl.htmlFor = input.id;
      cell.append(labelEl, input);
      tr.append(cell);
    });
    const change = element('td', '', '—');
    change.dataset.priceChange = '';
    change.dataset.label = 'Variação';
    const removeCell = document.createElement('td');
    const remove = element('button', 'economy-price-remove');
    remove.type = 'button';
    remove.dataset.priceRemove = '';
    remove.setAttribute('aria-label', 'Remover ' + (name || 'item'));
    const icon = element('i', 'fas fa-xmark');
    icon.setAttribute('aria-hidden', 'true');
    remove.append(icon);
    removeCell.append(remove);
    tr.append(change, removeCell);
    return tr;
  };
  const signedPercent = value => (value > 0 ? '+' : '') + numberFormat(value, 1) + '%';
  const updatePriceLab = () => {
    if (!priceRows) return;
    let beforeTotal = 0, nowTotal = 0;
    const items = [];
    priceRows.querySelectorAll('[data-price-row]').forEach(row => {
      const name = row.querySelector('.economy-price-name')?.value.trim() || 'Item';
      const before = Math.max(0, Number(row.querySelector('[data-price="before"]')?.value) || 0);
      const now = Math.max(0, Number(row.querySelector('[data-price="now"]')?.value) || 0);
      const changeEl = row.querySelector('[data-price-change]');
      beforeTotal += before; nowTotal += now;
      const difference = before === 0 ? null : ((now - before) / before) * 100;
      if (changeEl) {
        changeEl.textContent = difference === null ? 'Informe o preço anterior' : signedPercent(difference);
        changeEl.dataset.direction = difference === null ? '' : difference > 0.05 ? 'up' : difference < -0.05 ? 'down' : 'flat';
      }
      if (difference !== null) items.push({ name, difference });
    });
    const removeButtons = priceRows.querySelectorAll('[data-price-remove]');
    removeButtons.forEach(button => { button.disabled = removeButtons.length <= 1; });
    const totalDifference = beforeTotal === 0 ? null : ((nowTotal - beforeTotal) / beforeTotal) * 100;
    document.getElementById('price-total-before').textContent = money(beforeTotal);
    document.getElementById('price-total-now').textContent = money(nowTotal);
    document.getElementById('price-total-change').textContent = totalDifference === null ? 'Informe os preços anteriores' : signedPercent(totalDifference);
    if (!priceBars) return;
    const scale = Math.max(1, ...items.map(item => Math.abs(item.difference)));
    priceBars.replaceChildren(...items.map(item => {
      const row = element('div', 'economy-price-bar');
      row.dataset.direction = item.difference > 0.05 ? 'up' : item.difference < -0.05 ? 'down' : 'flat';
      const track = element('span', 'economy-price-bar-track');
      const fill = element('span', 'economy-price-bar-fill');
      fill.style.width = Math.max(2, Math.abs(item.difference) / scale * 100) + '%';
      track.append(fill);
      row.append(element('small', '', item.name), track, element('b', '', signedPercent(item.difference)));
      return row;
    }));
  };
  priceRows?.addEventListener('input', updatePriceLab);
  priceRows?.addEventListener('click', event => {
    const button = event.target.closest('[data-price-remove]');
    if (!button || priceRows.querySelectorAll('[data-price-row]').length <= 1) return;
    const row = button.closest('[data-price-row]');
    const next = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    updatePriceLab();
    next?.querySelector('.economy-price-name')?.focus();
  });
  document.getElementById('price-add-row')?.addEventListener('click', () => {
    if (!priceRows || priceRows.children.length >= 12) return;
    const row = createPriceRow('', '', '');
    priceRows.append(row);
    updatePriceLab();
    row.querySelector('.economy-price-name')?.focus();
  });
  document.querySelectorAll('[data-price-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = pricePresets[button.dataset.pricePreset];
    if (!preset || !priceRows) return;
    priceRows.replaceChildren(...preset.map(([name, before, now]) => createPriceRow(name, before.toFixed(2), now.toFixed(2))));
    document.querySelectorAll('[data-price-preset]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
    updatePriceLab();
  }));
  updatePriceLab();

  /* ------------------------------------------------------ poder de compra */

  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const monthLabel = key => { const [year, month] = key.split('-'); return monthNames[Number(month) - 1] + '/' + year; };
  const purchasing = { months: [], values: new Map(), ready: false };
  const purchasingValue = document.getElementById('purchasing-value');
  const purchasingMonth = document.getElementById('purchasing-month');
  const updatePurchasing = () => {
    const resultEl = document.getElementById('purchasing-result');
    const detailEl = document.getElementById('purchasing-detail');
    if (!resultEl || !detailEl || !purchasing.ready) return;
    const amount = Math.max(0, Number(purchasingValue?.value) || 0);
    const start = purchasingMonth?.value || '';
    const lastMonth = purchasing.months[purchasing.months.length - 1];
    const included = purchasing.months.filter(key => key >= start);
    if (!/^\d{4}-\d{2}$/.test(start) || start < purchasing.months[0]) {
      resultEl.textContent = '—';
      detailEl.textContent = 'Escolha um mês a partir de ' + monthLabel(purchasing.months[0]) + '.';
      return;
    }
    if (!included.length) {
      resultEl.textContent = '—';
      detailEl.textContent = 'O último IPCA divulgado é de ' + monthLabel(lastMonth) + '. Escolha um mês até essa data.';
      return;
    }
    const factor = included.reduce((total, key) => total * (1 + purchasing.values.get(key) / 100), 1);
    const corrected = amount * factor;
    resultEl.textContent = money(corrected);
    detailEl.textContent = 'Inflação acumulada de ' + numberFormat((factor - 1) * 100, 2) + '% entre ' + monthLabel(start) + ' e ' + monthLabel(lastMonth) + '. ' +
      money(amount) + ' em ' + monthLabel(start) + ' compravam o mesmo que cerca de ' + money(corrected) + ' hoje.';
    const maxValue = Math.max(amount, corrected) || 1;
    document.getElementById('purchasing-bar-then').style.width = (amount / maxValue * 100) + '%';
    document.getElementById('purchasing-bar-now').style.width = (corrected / maxValue * 100) + '%';
    document.getElementById('purchasing-bar-then-label').textContent = monthLabel(start) + ' · ' + money(amount);
    document.getElementById('purchasing-bar-now-label').textContent = monthLabel(lastMonth) + ' · ' + money(corrected);
  };
  const loadPurchasing = async () => {
    const detailEl = document.getElementById('purchasing-detail');
    try {
      // A API do SGS limita a janela de consulta; busca a série 433 em blocos de dez anos.
      const today = new Date();
      const chunks = [];
      for (let year = 2000; year <= today.getFullYear(); year += 10) {
        chunks.push(fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?' + new URLSearchParams({
          formato: 'json',
          dataInicial: '01/01/' + year,
          dataFinal: year + 9 >= today.getFullYear() ? formatQueryDate(today) : '31/12/' + (year + 9)
        }).toString(), 15000));
      }
      const rows = (await Promise.all(chunks)).flat().filter(row => row?.data && Number.isFinite(toNumber(row.valor)));
      rows.forEach(row => {
        const [, month, year] = row.data.split('/');
        purchasing.values.set(year + '-' + month, toNumber(row.valor));
      });
      purchasing.months = [...purchasing.values.keys()].sort();
      if (purchasing.months.length < 2) throw new Error('Série incompleta');
      purchasing.ready = true;
      if (purchasingMonth) {
        purchasingMonth.min = purchasing.months[0];
        purchasingMonth.max = purchasing.months[purchasing.months.length - 1];
      }
      updatePurchasing();
    } catch {
      if (detailEl) detailEl.textContent = 'Não foi possível consultar o IPCA agora. Tente novamente mais tarde ou use a Calculadora do Cidadão do Banco Central.';
    }
  };
  purchasingValue?.addEventListener('input', updatePurchasing);
  purchasingMonth?.addEventListener('input', updatePurchasing);
  document.querySelectorAll('[data-purchasing-years]').forEach(button => button.addEventListener('click', () => {
    if (!purchasing.ready || !purchasingMonth) return;
    const [year, month] = purchasing.months[purchasing.months.length - 1].split('-').map(Number);
    const target = (year - Number(button.dataset.purchasingYears)) + '-' + String(month).padStart(2, '0');
    purchasingMonth.value = target < purchasing.months[0] ? purchasing.months[0] : target;
    document.querySelectorAll('[data-purchasing-years]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
    updatePurchasing();
  }));
  loadPurchasing();

  /* ------------------------------------------------------ juros compostos */

  const compoundChart = document.getElementById('compound-chart');
  const updateCompound = () => {
    const initial = Math.max(0, Number(document.getElementById('compound-initial')?.value) || 0);
    const monthly = Math.max(0, Number(document.getElementById('compound-monthly')?.value) || 0);
    const annual = Math.min(100, Math.max(0, Number(document.getElementById('compound-rate')?.value) || 0));
    const years = Math.round(Math.min(60, Math.max(1, Number(document.getElementById('compound-years')?.value) || 1)));
    const rate = Math.pow(1 + annual / 100, 1 / 12) - 1;
    let balance = initial, invested = initial;
    const timeline = [];
    for (let month = 1; month <= years * 12; month++) {
      balance = balance * (1 + rate) + monthly;
      invested += monthly;
      if (month % 12 === 0) timeline.push({ year: month / 12, balance, invested });
    }
    document.getElementById('compound-result').textContent = money(balance);
    document.getElementById('compound-invested').textContent = money(invested);
    document.getElementById('compound-interest').textContent = money(Math.max(0, balance - invested));
    if (!compoundChart) return;
    const max = Math.max(1, ...timeline.map(point => point.balance));
    const labelEvery = Math.ceil(timeline.length / 6);
    compoundChart.style.setProperty('--bars', timeline.length);
    compoundChart.replaceChildren(...timeline.map((point, index) => {
      const column = element('div', 'economy-stack-column');
      column.title = 'Ano ' + point.year + ': ' + money(point.balance) + ' (aportado ' + money(point.invested) + ')';
      const bar = element('div', 'economy-stack-bar');
      bar.style.height = (point.balance / max * 100) + '%';
      const gain = element('span', 'is-gain');
      gain.style.flexGrow = String(Math.max(0, point.balance - point.invested));
      const base = element('span', 'is-base');
      base.style.flexGrow = String(point.invested);
      bar.append(gain, base);
      column.append(bar);
      // Rótulos espaçados: múltiplos do intervalo e sempre o último ano.
      const last = index === timeline.length - 1;
      const spaced = point.year % labelEvery === 0 && timeline.length - point.year >= labelEvery;
      if (last) column.append(element('small', 'is-last', point.year + (point.year === 1 ? ' ano' : ' anos')));
      else if (spaced) column.append(element('small', '', String(point.year)));
      return column;
    }));
  };
  ['compound-initial', 'compound-monthly', 'compound-rate', 'compound-years'].forEach(id => document.getElementById(id)?.addEventListener('input', updateCompound));
  updateCompound();
  onLatest((id, value) => {
    if (id === 'selic') { presetField('compound-rate', value); presetField('real-nominal', value); }
    if (id === 'ipca') presetField('real-inflation', value);
  });

  /* -------------------------------------------------- cenários da Selic */

  const selicScenarios = {
    up: {
      summary: 'O crédito tende a ficar mais caro e famílias e empresas podem adiar gastos. Isso pode ajudar a desacelerar a inflação com o tempo.',
      effects: [
        ['Crédito', 'up', 'Empréstimos e financiamentos tendem a encarecer.'],
        ['Consumo e investimento', 'down', 'Famílias e empresas tendem a adiar compras e projetos.'],
        ['Inflação', 'down', 'A pressão sobre os preços tende a diminuir, com defasagem de alguns meses.'],
        ['Renda fixa pós-fixada', 'up', 'Aplicações atreladas à Selic ou ao CDI tendem a render mais.'],
        ['Custo da dívida pública', 'up', 'A parcela da dívida ligada aos juros fica mais cara para o governo.']
      ]
    },
    flat: {
      summary: 'Os efeitos continuam sendo sentidos gradualmente; as taxas cobradas pelos bancos não mudam todas ao mesmo tempo.',
      effects: [
        ['Crédito', 'flat', 'As taxas bancárias ainda podem mudar por risco, prazo e concorrência.'],
        ['Consumo e investimento', 'flat', 'Decisões anteriores do Copom continuam fazendo efeito por vários meses.'],
        ['Inflação', 'flat', 'A trajetória depende também de expectativas, câmbio, alimentos e energia.'],
        ['Renda fixa pós-fixada', 'flat', 'O rendimento de aplicações atreladas à Selic tende a se manter.'],
        ['Custo da dívida pública', 'flat', 'O custo dos juros acompanha o nível da taxa e o perfil da dívida.']
      ]
    },
    down: {
      summary: 'O crédito pode ficar mais barato e a atividade ganhar estímulo. Aplicações ligadas à taxa também podem render menos.',
      effects: [
        ['Crédito', 'down', 'Empréstimos e financiamentos tendem a ficar mais baratos.'],
        ['Consumo e investimento', 'up', 'Compras a prazo e novos projetos podem ganhar estímulo.'],
        ['Inflação', 'up', 'Se a demanda acelerar demais, a pressão sobre os preços pode aumentar.'],
        ['Renda fixa pós-fixada', 'down', 'Aplicações atreladas à Selic ou ao CDI tendem a render menos.'],
        ['Custo da dívida pública', 'down', 'A parcela da dívida ligada aos juros fica mais barata para o governo.']
      ]
    }
  };
  const effectLabels = { up: 'tende a subir', down: 'tende a cair', flat: 'tende a se manter' };
  const selicTabs = [...document.querySelectorAll('[data-selic-scenario]')];
  const selicPanel = document.getElementById('selic-scenario-panel');
  const selectScenario = (tab, focus = false) => {
    const scenario = selicScenarios[tab.dataset.selicScenario];
    if (!scenario || !selicPanel) return;
    selicTabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    if (focus) tab.focus();
    selicPanel.setAttribute('aria-labelledby', tab.id);
    selicPanel.dataset.scenario = tab.dataset.selicScenario;
    document.getElementById('selic-scenario-summary').textContent = scenario.summary;
    document.getElementById('selic-scenario-effects').replaceChildren(...scenario.effects.map(([label, direction, text], index) => {
      const item = element('li', 'economy-effect');
      item.dataset.direction = direction;
      item.style.setProperty('--i', index);
      const badge = element('span', 'economy-effect-badge');
      const icon = element('i', 'fas ' + trendIcons[direction]);
      icon.setAttribute('aria-hidden', 'true');
      badge.append(icon, document.createTextNode(' ' + effectLabels[direction]));
      const body = element('div');
      body.append(element('strong', '', label), element('p', '', text));
      item.append(body, badge);
      return item;
    }));
  };
  selicTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScenario(tab));
    tab.addEventListener('keydown', event => {
      const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        selectScenario(selicTabs[event.key === 'Home' ? 0 : selicTabs.length - 1], true);
      } else if (offset) {
        event.preventDefault();
        selectScenario(selicTabs[(index + offset + selicTabs.length) % selicTabs.length], true);
      }
    });
  });
  if (selicTabs[0]) selectScenario(selicTabs[0]);


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

  /* ------------------------------------------- economia em perspectiva */

  const chartSvg = document.getElementById('economy-history-chart');
  const chartWrap = document.getElementById('economy-chart-wrap');
  const chartStatus = document.getElementById('economy-chart-status');
  const chartTooltip = document.getElementById('economy-chart-tooltip');
  const chartRetry = document.getElementById('economy-chart-load');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chartNames = {
    '432': { title: 'Meta Selic definida pelo Copom', short: 'Meta Selic', unit: '% a.a.', source: 'Banco Central do Brasil · SGS 432', frequency: 'diária, consolidada pelo último valor de cada mês', step: true },
    // Meta contínua de inflação definida pelo CMN: 3%, com tolerância de 1,5 ponto para cima ou para baixo.
    '13522': { title: 'IPCA acumulado em 12 meses', short: 'IPCA 12 meses', unit: '%', source: 'Banco Central do Brasil · SGS 13522, com dados do IPCA calculado pelo IBGE', frequency: 'mensal', target: { center: 3, low: 1.5, high: 4.5 } }
  };
  const chartState = { code: '432', count: 24, rows: null, values: null, selected: null, animate: true };
  let chartRequestId = 0;

  const monthKeyLabel = row => {
    const [, month, year] = String(row.data).split('/');
    return monthNames[Number(month) - 1] + '/' + year;
  };
  const shortMonthLabel = row => {
    const [, month, year] = String(row.data).split('/');
    return monthNames[Number(month) - 1] + '/' + year.slice(2);
  };
  const signedPoints = value => (value > 0 ? '+' : value < 0 ? '−' : '') + numberFormat(Math.abs(value), 2) + ' p.p.';

  // Escala "redonda" para as linhas de grade: passos de 1, 2, 2,5 ou 5 × 10ⁿ.
  const niceScale = (min, max, targetTicks) => {
    const span = max - min || Math.abs(max) || 1;
    const raw = span / targetTicks;
    const power = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(factor => factor * power).find(candidate => candidate >= raw) || raw;
    const low = Math.floor(min / step) * step;
    const high = Math.ceil(max / step) * step;
    return { low, high: high === low ? low + step : high, step };
  };

  // Curva monotônica (Fritsch–Carlson): suaviza sem criar picos que não existem nos dados.
  const monotonePath = points => {
    if (points.length < 3) return 'M' + points.map(([px, py]) => px + ',' + py).join('L');
    const n = points.length;
    const dx = [], slope = [], tangent = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = points[i + 1][0] - points[i][0];
      slope[i] = (points[i + 1][1] - points[i][1]) / dx[i];
    }
    tangent[0] = slope[0];
    tangent[n - 1] = slope[n - 2];
    for (let i = 1; i < n - 1; i++) tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (slope[i] === 0) { tangent[i] = 0; tangent[i + 1] = 0; continue; }
      const a = tangent[i] / slope[i], b = tangent[i + 1] / slope[i], h = a * a + b * b;
      if (h > 9) { const t = 3 / Math.sqrt(h); tangent[i] = t * a * slope[i]; tangent[i + 1] = t * b * slope[i]; }
    }
    let d = 'M' + points[0][0] + ',' + points[0][1];
    for (let i = 0; i < n - 1; i++) {
      const [x0, y0] = points[i], [x1, y1] = points[i + 1], third = dx[i] / 3;
      d += 'C' + (x0 + third) + ',' + (y0 + tangent[i] * third) + ' ' + (x1 - third) + ',' + (y1 - tangent[i + 1] * third) + ' ' + x1 + ',' + y1;
    }
    return d;
  };
  // Degraus: a Meta Selic muda apenas nas reuniões do Copom.
  const stepPath = points => points.reduce((d, [px, py], i) => d + (i === 0 ? 'M' + px + ',' + py : 'H' + px + 'V' + py), '');

  const updateChartStats = (rows, values, code) => {
    const unit = chartNames[code].unit;
    const last = values.length - 1;
    let maxIndex = 0, minIndex = 0;
    values.forEach((value, i) => {
      if (value >= values[maxIndex]) maxIndex = i;
      if (value <= values[minIndex]) minIndex = i;
    });
    const change = values[last] - values[0];
    document.getElementById('chart-stat-last').textContent = numberFormat(values[last], 2) + ' ' + unit;
    document.getElementById('chart-stat-last-note').textContent = monthKeyLabel(rows[last]);
    const changeEl = document.getElementById('chart-stat-change');
    changeEl.textContent = Math.abs(change) < 0.005 ? 'Estável' : signedPoints(change);
    changeEl.dataset.direction = Math.abs(change) < 0.005 ? 'flat' : change > 0 ? 'up' : 'down';
    document.getElementById('chart-stat-change-note').textContent = 'desde ' + monthKeyLabel(rows[0]);
    document.getElementById('chart-stat-max').textContent = numberFormat(values[maxIndex], 2) + ' ' + unit;
    document.getElementById('chart-stat-max-note').textContent = monthKeyLabel(rows[maxIndex]);
    document.getElementById('chart-stat-min').textContent = numberFormat(values[minIndex], 2) + ' ' + unit;
    document.getElementById('chart-stat-min-note').textContent = monthKeyLabel(rows[minIndex]);
  };

  const renderHistoryChart = () => {
    const { rows, values, code } = chartState;
    if (!chartSvg || !rows?.length) return;
    const info = chartNames[code];
    // O viewBox acompanha a largura real: textos e traços mantêm o tamanho em qualquer tela.
    const width = Math.max(280, Math.round(chartWrap?.clientWidth || 760));
    const compact = width < 520;
    const height = compact ? 250 : 320;
    const left = compact ? 30 : 40, right = compact ? 12 : 22, top = 30, bottom = 34;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;

    let dataMin = Math.min(...values), dataMax = Math.max(...values);
    if (info.target) { dataMin = Math.min(dataMin, info.target.low); dataMax = Math.max(dataMax, info.target.high); }
    const pad = (dataMax - dataMin || 1) * .12;
    const scale = niceScale(Math.max(0, dataMin - pad), dataMax + pad, compact ? 4 : 5);
    const x = i => left + (rows.length === 1 ? plotWidth / 2 : i * plotWidth / (rows.length - 1));
    const y = value => top + (scale.high - value) * plotHeight / (scale.high - scale.low);
    const make = (tag, attrs, content) => {
      const node = svgNode(tag, attrs);
      if (content !== undefined) node.textContent = content;
      return node;
    };

    const gradientId = 'economy-chart-fill-' + code;
    const defs = make('defs');
    const gradient = make('linearGradient', { id: gradientId, x1: 0, y1: 0, x2: 0, y2: 1 });
    gradient.append(
      make('stop', { offset: '0%', class: 'economy-chart-fill-top' }),
      make('stop', { offset: '100%', class: 'economy-chart-fill-bottom' })
    );
    defs.append(gradient);
    const children = [defs];

    // Grade horizontal; os valores ficam numa margem à esquerda e a unidade aparece uma vez, acima.
    for (let value = scale.low; value <= scale.high + scale.step / 2; value += scale.step) {
      const yy = y(value);
      children.push(make('line', { x1: left, y1: yy, x2: width - right, y2: yy, class: 'economy-chart-gridline' + (value === scale.low ? ' is-base' : '') }));
      children.push(make('text', { x: left - 8, y: yy + 4, 'text-anchor': 'end', class: 'economy-chart-label economy-chart-y-label' }, numberFormat(value, scale.step < 1 ? 1 : 0)));
    }
    children.push(make('text', { x: left - 8, y: 17, class: 'economy-chart-label economy-chart-unit' }, 'em ' + info.unit));

    // Faixa da meta de inflação, com legenda acima da área do gráfico.
    let targetKey = null, targetText = null;
    if (info.target) {
      const { center, low, high } = info.target;
      children.push(make('rect', { x: left, y: y(high), width: plotWidth, height: y(low) - y(high), class: 'economy-chart-target-band' }));
      children.push(make('line', { x1: left, y1: y(center), x2: width - right, y2: y(center), class: 'economy-chart-target-line' }));
      const legendX = width - right;
      targetKey = make('rect', { x: legendX - 120, y: 9, width: 14, height: 9, rx: 2, class: 'economy-chart-target-band economy-chart-target-key' });
      targetText = make('text', { x: legendX, y: 17, 'text-anchor': 'end', class: 'economy-chart-label economy-chart-target-label' }, compact ? 'Meta 3% (1,5–4,5%)' : 'Meta de inflação: 3% (tolerância de 1,5% a 4,5%)');
      children.push(targetKey, targetText);
    }

    // Rótulos do eixo horizontal, espaçados pela largura disponível.
    const maxLabels = Math.max(2, Math.floor(plotWidth / (compact ? 62 : 78)));
    const stride = Math.max(1, Math.ceil((rows.length - 1) / (maxLabels - 1)));
    for (let i = 0; i < rows.length; i += stride) {
      if (i === rows.length - 1 || rows.length - 1 - i < stride * .6) continue;
      children.push(make('text', { x: x(i), y: height - 10, 'text-anchor': i === 0 ? 'start' : 'middle', class: 'economy-chart-label economy-chart-x-label' }, shortMonthLabel(rows[i])));
    }
    children.push(make('text', { x: x(rows.length - 1), y: height - 10, 'text-anchor': 'end', class: 'economy-chart-label economy-chart-x-label' }, shortMonthLabel(rows[rows.length - 1])));

    const points = values.map((value, i) => [Number(x(i).toFixed(2)), Number(y(value).toFixed(2))]);
    const linePath = info.step ? stepPath(points) : monotonePath(points);
    const baseline = y(scale.low).toFixed(2);
    children.push(make('path', { d: linePath + 'V' + baseline + 'H' + points[0][0] + 'Z', class: 'economy-chart-area', fill: 'url(#' + gradientId + ')' }));
    const line = make('path', { d: linePath, class: 'economy-chart-line' });
    children.push(line);

    // Mudanças da Meta Selic (decisões do Copom) ficam marcadas na linha.
    if (info.step) {
      values.forEach((value, i) => {
        if (i === 0 || Math.abs(value - values[i - 1]) < 0.005) return;
        children.push(make('circle', { cx: points[i][0], cy: points[i][1], r: 3.5, class: 'economy-chart-change' + (value > values[i - 1] ? ' is-up' : ' is-down') }));
      });
    }

    // Último valor em destaque.
    const [lastX, lastY] = points[points.length - 1];
    children.push(make('circle', { cx: lastX, cy: lastY, r: 9, class: 'economy-chart-last-halo' }));
    children.push(make('circle', { cx: lastX, cy: lastY, r: 4.5, class: 'economy-chart-point' }));

    children.push(make('rect', { x: left, y: top, width: plotWidth, height: plotHeight, class: 'economy-chart-hit-area' }));
    const selection = make('g', { class: 'economy-chart-selection', 'aria-hidden': 'true' });
    selection.append(
      make('line', { x1: 0, y1: top, x2: 0, y2: top + plotHeight, class: 'economy-chart-crosshair' }),
      make('circle', { cx: 0, cy: 0, r: 6, class: 'economy-chart-selected-point' })
    );
    children.push(selection);

    chartSvg.replaceChildren(...children);
    if (targetKey && targetText?.getComputedTextLength) {
      targetKey.setAttribute('x', width - right - targetText.getComputedTextLength() - 20);
    }
    chartSvg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    chartSvg.style.aspectRatio = width + ' / ' + height;
    chartSvg.setAttribute('role', 'group');
    chartSvg.setAttribute('tabindex', '0');

    if (chartState.animate && !reduceMotion.matches && typeof line.getTotalLength === 'function') {
      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      chartSvg.classList.remove('is-drawing');
      void chartSvg.getBoundingClientRect();
      chartSvg.classList.add('is-drawing');
      line.addEventListener('animationend', () => { line.style.strokeDasharray = ''; line.style.strokeDashoffset = ''; }, { once: true });
    } else {
      // Redesenhos por redimensionamento não repetem a animação de entrada.
      chartSvg.classList.remove('is-drawing');
    }
    chartState.animate = false;

    const selectPoint = (index, { showTooltip = true } = {}) => {
      const safeIndex = Math.max(0, Math.min(rows.length - 1, index));
      const [pointX, pointY] = points[safeIndex];
      selection.querySelector('.economy-chart-crosshair').setAttribute('x1', pointX);
      selection.querySelector('.economy-chart-crosshair').setAttribute('x2', pointX);
      selection.querySelector('.economy-chart-selected-point').setAttribute('cx', pointX);
      selection.querySelector('.economy-chart-selected-point').setAttribute('cy', pointY);
      selection.classList.toggle('is-visible', showTooltip);
      chartState.selected = safeIndex;
      chartSvg.dataset.selectedIndex = String(safeIndex);
      chartSvg.setAttribute('aria-label', 'Gráfico interativo: ' + info.title + '. Selecionado: ' + rows[safeIndex].data + ', ' + numberFormat(values[safeIndex], 2) + ' ' + info.unit + (info.unit.endsWith('.') ? '' : '.') + ' Use as setas esquerda e direita para percorrer os meses.');
      if (!chartTooltip) return;
      chartTooltip.hidden = !showTooltip;
      if (!showTooltip) return;
      chartTooltip.querySelector('[data-tooltip-date]').textContent = monthKeyLabel(rows[safeIndex]);
      chartTooltip.querySelector('[data-tooltip-value]').textContent = numberFormat(values[safeIndex], 2) + ' ' + info.unit;
      const delta = safeIndex > 0 ? values[safeIndex] - values[safeIndex - 1] : null;
      const deltaEl = chartTooltip.querySelector('[data-tooltip-delta]');
      deltaEl.textContent = delta === null ? 'Início do período' : Math.abs(delta) < 0.005 ? 'Sem mudança no mês' : signedPoints(delta) + ' no mês';
      deltaEl.dataset.direction = delta === null || Math.abs(delta) < 0.005 ? 'flat' : delta > 0 ? 'up' : 'down';
      // Converte a posição do ponto para pixels do contêiner e mantém o balão dentro dele.
      const ratio = (chartSvg.getBoundingClientRect().width || width) / width;
      const tipWidth = chartTooltip.offsetWidth || 150;
      const pxX = pointX * ratio, pxY = pointY * ratio;
      const placeLeft = pxX + 14 + tipWidth > width * ratio;
      chartTooltip.style.left = Math.max(4, placeLeft ? pxX - 14 - tipWidth : pxX + 14) + 'px';
      chartTooltip.style.top = Math.max(4, pxY - (chartTooltip.offsetHeight || 60) - 10) + 'px';
    };
    const pointFromPointer = event => {
      const rect = chartSvg.getBoundingClientRect();
      if (!rect.width) return rows.length - 1;
      const viewX = (event.clientX - rect.left) * width / rect.width;
      return Math.round((viewX - left) / plotWidth * (rows.length - 1));
    };
    chartSvg.onpointermove = event => selectPoint(pointFromPointer(event));
    chartSvg.onpointerdown = event => selectPoint(pointFromPointer(event));
    chartSvg.onpointerleave = event => { if (event.pointerType === 'mouse') selectPoint(chartState.selected ?? rows.length - 1, { showTooltip: false }); };
    chartSvg.onblur = () => selectPoint(chartState.selected ?? rows.length - 1, { showTooltip: false });
    chartSvg.onkeydown = event => {
      let index = Number(chartSvg.dataset.selectedIndex || rows.length - 1);
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') index++;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') index--;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = rows.length - 1;
      else return;
      event.preventDefault();
      selectPoint(index);
    };
    selectPoint(Math.min(chartState.selected ?? rows.length - 1, rows.length - 1), { showTooltip: false });
  };

  const showChartMessage = text => {
    if (!chartSvg) return;
    chartSvg.setAttribute('viewBox', '0 0 760 320');
    chartSvg.style.aspectRatio = '';
    const message = svgNode('text', { x: 380, y: 160, 'text-anchor': 'middle', class: 'economy-chart-label economy-chart-message' });
    message.textContent = text;
    chartSvg.replaceChildren(message);
    if (chartTooltip) chartTooltip.hidden = true;
  };

  const loadHistoryChart = async () => {
    if (!chartSvg || !chartStatus) return;
    const requestId = ++chartRequestId;
    const { code, count } = chartState;
    chartStatus.textContent = 'Consultando até ' + count + ' meses da série oficial…';
    chartWrap?.setAttribute('aria-busy', 'true');
    if (chartRetry) chartRetry.hidden = true;
    try {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - count + 1, 1);
      const params = new URLSearchParams({ formato: 'json', dataInicial: formatQueryDate(start), dataFinal: formatQueryDate(end) });
      const payload = await fetchJson('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados?' + params.toString());
      if (requestId !== chartRequestId) return;
      const sorted = Array.isArray(payload) ? payload
        .filter(row => row && row.data && Number.isFinite(toNumber(row.valor)))
        .sort((a, b) => parseSgsDate(a.data) - parseSgsDate(b.data)) : [];
      const rows = lastPerMonth(sorted).slice(-count);
      if (rows.length < 2) throw new Error('Poucas observações disponíveis');
      Object.assign(chartState, { rows, values: rows.map(row => toNumber(row.valor)), selected: null, animate: true });
      renderHistoryChart();
      updateChartStats(rows, chartState.values, code);
      chartStatus.textContent = rows.length + ' observações mensais. Passe o cursor, toque no gráfico ou use as setas do teclado para consultar cada mês.' + (chartNames[code].step ? ' Os pontos marcam os meses em que a meta mudou.' : '');
      const caption = document.getElementById('economy-chart-caption');
      if (caption) caption.textContent = 'Fonte: ' + chartNames[code].source + '. Série ' + chartNames[code].frequency + ', em ' + chartNames[code].unit + ' e sem reindexação.' + (chartNames[code].target ? ' A faixa sombreada é a meta contínua de inflação definida pelo Conselho Monetário Nacional.' : ' A meta Selic é definida pelo Copom.');
    } catch {
      if (requestId !== chartRequestId) return;
      chartState.rows = null;
      chartStatus.textContent = 'Não foi possível carregar a série solicitada. Verifique a conexão e tente novamente.';
      showChartMessage('Dados temporariamente indisponíveis');
      ['last', 'change', 'max', 'min'].forEach(key => {
        document.getElementById('chart-stat-' + key).textContent = '—';
        document.getElementById('chart-stat-' + key + '-note').textContent = ' ';
      });
      if (chartRetry) chartRetry.hidden = false;
    } finally {
      if (requestId === chartRequestId) chartWrap?.removeAttribute('aria-busy');
    }
  };

  const bindChartToggle = (attribute, key) => {
    const buttons = [...document.querySelectorAll('[' + attribute + ']')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const value = button.getAttribute(attribute);
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      if (String(chartState[key]) === value) return;
      chartState[key] = key === 'count' ? Number(value) : value;
      loadHistoryChart();
    }));
  };
  bindChartToggle('data-chart-series', 'code');
  bindChartToggle('data-chart-count', 'count');
  chartRetry?.addEventListener('click', loadHistoryChart);
  if ('ResizeObserver' in window && chartWrap) {
    let lastWidth = 0, frame = 0;
    new ResizeObserver(entries => {
      const nextWidth = Math.round(entries[0].contentRect.width);
      if (!chartState.rows || Math.abs(nextWidth - lastWidth) < 2) return;
      lastWidth = nextWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(renderHistoryChart);
    }).observe(chartWrap);
  }
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
    document.body.classList.add('modal-open');
  };
  const unlockModalPageScroll = () => {
    document.body.classList.remove('modal-open');
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
      '<div class="detail-panel-backdrop" aria-hidden="true"></div>' +
      '<div class="detail-panel-dialog" role="dialog" aria-modal="true" aria-labelledby="economy-modal-title">' +
        '<div class="detail-header">' +
          '<div><span class="detail-kicker">Guia de economia</span><h2 id="economy-modal-title">' + item.title + '</h2></div>' +
          '<button class="accordion-close" type="button" aria-label="Fechar explicação"><i class="fas fa-times" aria-hidden="true"></i></button>' +
        '</div>' +
        '<div class="detail-lead economy-modal-body">' + item.body + '</div>' +
        '<div class="economy-modal-footer"><a href="' + item.source + '" target="_blank" rel="noopener noreferrer">Consultar fonte oficial <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a><button type="button" class="cta-button economy-modal-done">Fechar</button></div>' +
      '</div>';
    lockModalPageScroll();
    modal.classList.add('open');
    modal.querySelector('.detail-panel-backdrop')?.addEventListener('click', closeModal);
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
    if (!input || input.value === '' || !Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  };
  const setWidth = (id, percent) => {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.max(0, Math.min(100, percent)) + '%';
  };
  const updateBasket = () => {
    const value = clampNumber('basket-value', 0, 10000000, 200), rate = clampNumber('basket-inflation', -99, 1000, 5);
    const result = value * (1 + rate / 100);
    document.getElementById('basket-result').textContent = money(result);
    document.getElementById('basket-difference').textContent = (result >= value ? 'Aumento de ' : 'Redução de ') + money(Math.abs(result - value));
    const max = Math.max(value, result) || 1;
    setWidth('basket-bar-now', value / max * 100);
    setWidth('basket-bar-after', result / max * 100);
  };
  const updateLoan = () => {
    const principal = clampNumber('loan-value', 1, 10000000, 1000), rate = clampNumber('loan-rate', 0, 100, 2) / 100, months = Math.round(clampNumber('loan-months', 1, 360, 12));
    const payment = rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
    const total = payment * months, interest = Math.max(0, total - principal);
    document.getElementById('loan-result').textContent = money(payment);
    document.getElementById('loan-total').textContent = 'Total estimado: ' + money(total) + ' em ' + months + (months === 1 ? ' parcela' : ' parcelas');
    document.getElementById('loan-interest').textContent = 'Juros estimados: ' + money(interest) + ' (' + numberFormat(interest / principal * 100, 1) + '% do valor emprestado)';
    setWidth('loan-bar-principal', principal / total * 100);
    setWidth('loan-bar-interest', interest / total * 100);
  };
  const updateRealRate = () => {
    const nominal = clampNumber('real-nominal', -50, 500, 10), inflation = clampNumber('real-inflation', -50, 500, 4.5);
    const real = ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;
    document.getElementById('real-result').textContent = (real > 0 ? '+' : '') + numberFormat(real, 2) + '% no período';
    document.getElementById('real-explanation').textContent = real >= 0
      ? 'Com ' + numberFormat(nominal, 2) + '% de juro e ' + numberFormat(inflation, 2) + '% de inflação, o poder de compra do valor aplicado cresce cerca de ' + numberFormat(real, 2) + '%.'
      : 'A inflação supera o juro: o dinheiro rende ' + numberFormat(nominal, 2) + '%, mas perde cerca de ' + numberFormat(Math.abs(real), 2) + '% de poder de compra.';
    // Escala visual simétrica de -12,5% a +12,5%; o zero fica no centro da barra.
    const marker = document.getElementById('real-marker');
    if (marker) {
      marker.style.left = Math.max(0, Math.min(100, (real + 12.5) / 25 * 100)) + '%';
      marker.dataset.direction = real >= 0 ? 'up' : 'down';
    }
  };
  const updateFiscal = () => {
    const growth = clampNumber('revenue-growth', -20, 20, 3), share = document.getElementById('fiscal-target')?.value === 'yes' ? .7 : .5;
    const raw = growth * share, result = Math.max(.6, Math.min(2.5, raw));
    document.getElementById('fiscal-result').textContent = numberFormat(result, 1) + '%';
    const limited = raw < .6 ? ' abaixo do piso; o limite ilustrativo sobe para 0,6%.' : raw > 2.5 ? ' acima do teto; o limite ilustrativo fica em 2,5%.' : ', dentro do intervalo de 0,6% a 2,5%.';
    document.getElementById('fiscal-explanation').textContent = numberFormat(share * 100, 0) + '% de ' + numberFormat(growth, 1) + '% = ' + numberFormat(raw, 2) + '%' + limited;
    // Escala visual de 0% a 3%.
    const marker = document.getElementById('fiscal-marker');
    if (marker) marker.style.left = (result / 3 * 100) + '%';
  };
  ['basket-value', 'basket-inflation'].forEach(id => document.getElementById(id)?.addEventListener('input', updateBasket));
  ['loan-value', 'loan-rate', 'loan-months'].forEach(id => document.getElementById(id)?.addEventListener('input', updateLoan));
  ['real-nominal', 'real-inflation'].forEach(id => document.getElementById(id)?.addEventListener('input', updateRealRate));
  // Seletor pesquisável no padrão do Impostômetro (components.css + option-picker.js).
  window.KingsOptionPicker?.enhance(document.getElementById('main'));
  ['revenue-growth', 'fiscal-target'].forEach(id => document.getElementById(id)?.addEventListener('input', updateFiscal));
  document.getElementById('fiscal-target')?.addEventListener('change', updateFiscal);
  updateBasket(); updateLoan(); updateRealRate(); updateFiscal();
})();
