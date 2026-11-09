(() => {
  'use strict';

  const API = '/api/impostometro';
  const REFRESH_MS = 10 * 60 * 1000;
  const FIRST_YEAR = 2010;

  const UF_NAMES = {
    ac: 'Acre', al: 'Alagoas', am: 'Amazonas', ap: 'Amapá', ba: 'Bahia', ce: 'Ceará', df: 'Distrito Federal',
    es: 'Espírito Santo', go: 'Goiás', ma: 'Maranhão', mg: 'Minas Gerais', ms: 'Mato Grosso do Sul',
    mt: 'Mato Grosso', pa: 'Pará', pb: 'Paraíba', pe: 'Pernambuco', pi: 'Piauí', pr: 'Paraná',
    rj: 'Rio de Janeiro', rn: 'Rio Grande do Norte', ro: 'Rondônia', rr: 'Roraima', rs: 'Rio Grande do Sul',
    sc: 'Santa Catarina', se: 'Sergipe', sp: 'São Paulo', to: 'Tocantins'
  };
  const CAPITALS = {
    ac: 'rio-branco', al: 'maceio', am: 'manaus', ap: 'macapa', ba: 'salvador', ce: 'fortaleza', df: 'brasilia',
    es: 'vitoria', go: 'goiania', ma: 'sao-luis', mg: 'belo-horizonte', ms: 'campo-grande', mt: 'cuiaba',
    pa: 'belem', pb: 'joao-pessoa', pe: 'recife', pi: 'teresina', pr: 'curitiba', rj: 'rio-de-janeiro',
    rn: 'natal', ro: 'porto-velho', rr: 'boa-vista', rs: 'porto-alegre', sc: 'florianopolis', se: 'aracaju',
    sp: 'sao-paulo', to: 'palmas'
  };
  const DEFAULT_TAX = { federal: 'cofins', estadual: 'icms', municipal: 'iss' };
  const SPHERE_LABEL = { federal: 'Tributo federal', estadual: 'Tributo estadual', municipal: 'Tributo municipal' };

  const { LiveMeter, createApiClient, brasiliaYear, format } = window.KingsLiveCounter;
  const { brlInteger, compactBRL, percent } = format;
  const { fetchJson, fetchCached } = createApiClient(API);

  const titleCase = text => String(text || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => (index > 0 && /^(d[aeo]s?|e)$/.test(word)) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  /* ---------------------------------------------------- contadores do topo */

  const acspMeter = new LiveMeter(document.getElementById('meter-acsp'), { onRender: value => updateLiveYear(value) });
  const orgMeter = new LiveMeter(document.getElementById('meter-org'));
  let lastTopRefresh = 0;
  let currentYearTotal = null;

  const loadTopMeter = async (meter, params) => {
    meter.setLoading();
    try {
      const data = await fetchJson(params);
      meter.setData(data);
      return data;
    } catch (error) {
      meter.setError(error.message, () => loadTopMeter(meter, params));
      return null;
    }
  };

  const refreshTopMeters = async () => {
    lastTopRefresh = Date.now();
    const [acsp] = await Promise.all([
      loadTopMeter(acspMeter, { fonte: 'acsp' }),
      loadTopMeter(orgMeter, { fonte: 'org' })
    ]);
    if (acsp) {
      currentYearTotal = acsp;
      renderHistory();
    }
  };

  /* ------------------------------------------------------------ explorador */

  const form = document.getElementById('explorer-form');
  const yearSelect = document.getElementById('explorer-year');
  const ufSelect = document.getElementById('explorer-uf');
  const citySelect = document.getElementById('explorer-city');
  const sphereSelect = document.getElementById('explorer-sphere');
  const taxSelect = document.getElementById('explorer-tax');
  const explorerCard = document.getElementById('meter-explorer');
  const explorerMeter = new LiveMeter(explorerCard);
  const explorerKind = explorerCard.querySelector('[data-explorer-kind]');
  const explorerTitle = explorerCard.querySelector('[data-explorer-title]');
  const explorerShare = explorerCard.querySelector('[data-explorer-share]');
  let explorerRequest = 0;

  const currentScope = () => form.querySelector('input[name="escopo"]:checked')?.value || 'estado';

  const fillSelect = (select, options, selected) => {
    select.replaceChildren(...options.map(({ value, label, meta }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      if (meta) option.dataset.meta = meta;
      option.selected = value === selected;
      return option;
    }));
  };

  const initFilters = () => {
    const currentYear = brasiliaYear();
    const years = [];
    for (let year = currentYear; year >= FIRST_YEAR; year -= 1) {
      years.push({ value: String(year), label: String(year), meta: year === currentYear ? 'até hoje' : 'encerrado' });
    }
    fillSelect(yearSelect, years, String(currentYear));
    fillSelect(ufSelect, Object.entries(UF_NAMES)
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([value, label]) => ({ value, label, meta: value.toUpperCase() })), 'sp');
    window.KingsOptionPicker?.enhance(form);
  };

  const syncScopeFields = () => {
    const scope = currentScope();
    const visible = { estado: ['ano', 'uf'], municipio: ['ano', 'uf', 'municipio'], tributo: ['ano', 'esfera', 'tributo'] }[scope];
    form.querySelectorAll('[data-filter]').forEach(label => { label.hidden = !visible.includes(label.dataset.filter); });
    form.querySelectorAll('.tax-meter-scope label').forEach(label => {
      label.classList.toggle('is-active', label.querySelector('input').checked);
    });
  };

  const loadOptions = async (select, params, mapItems, preferred) => {
    select.disabled = true;
    fillSelect(select, [{ value: '', label: 'Carregando…' }], '');
    try {
      const items = mapItems(await fetchCached(params));
      const selected = items.some(item => item.value === preferred) ? preferred : items[0]?.value;
      fillSelect(select, items, selected);
      select.disabled = !items.length;
      return Boolean(items.length);
    } catch {
      fillSelect(select, [{ value: '', label: 'Lista indisponível' }], '');
      return false;
    }
  };

  const loadCities = () => loadOptions(
    citySelect,
    { lista: 'municipios', uf: ufSelect.value },
    body => body.municipios.map(item => ({ value: item.id, label: titleCase(item.nome) })),
    CAPITALS[ufSelect.value]
  );

  const loadTaxes = () => loadOptions(
    taxSelect,
    { lista: 'tributos', esfera: sphereSelect.value },
    body => body.tributos.map(item => ({ value: item.id, label: item.nome })),
    DEFAULT_TAX[sphereSelect.value]
  );

  const describeSelection = scope => {
    const year = yearSelect.value;
    if (scope === 'estado') return { kind: 'Estado', title: `${UF_NAMES[ufSelect.value]} em ${year}` };
    if (scope === 'municipio') {
      const city = citySelect.selectedOptions[0]?.textContent || '';
      return { kind: 'Município', title: `${city} (${ufSelect.value.toUpperCase()}) em ${year}` };
    }
    const tax = taxSelect.selectedOptions[0]?.textContent || '';
    return { kind: SPHERE_LABEL[sphereSelect.value], title: `${tax} em ${year}` };
  };

  const updateShare = async (data, requestId) => {
    explorerShare.hidden = true;
    try {
      const total = await fetchCached({ fonte: 'acsp', ano: String(data.periodo.ano) });
      if (requestId !== explorerRequest || !total.valor) return;
      const share = data.valor / total.valor;
      if (!Number.isFinite(share) || share <= 0 || share > 1) return;
      explorerShare.textContent = `Equivale a ${percent.format(share)} do total arrecadado no Brasil em ${data.periodo.ano}.`;
      explorerShare.hidden = false;
    } catch { /* participação é complementar */ }
  };

  const loadExplorer = async () => {
    const requestId = ++explorerRequest;
    const scope = currentScope();
    const params = { fonte: 'acsp', escopo: scope, ano: yearSelect.value };
    if (scope === 'estado' || scope === 'municipio') params.uf = ufSelect.value;
    if (scope === 'municipio') params.municipio = citySelect.value;
    if (scope === 'tributo') {
      params.esfera = sphereSelect.value;
      params.tributo = taxSelect.value;
    }

    const { kind, title } = describeSelection(scope);
    explorerKind.textContent = kind;
    explorerTitle.textContent = title;
    explorerShare.hidden = true;

    if ((scope === 'municipio' && !params.municipio) || (scope === 'tributo' && !params.tributo)) {
      explorerMeter.setError('Não foi possível carregar as opções deste recorte.', () => initScope());
      return;
    }

    explorerMeter.setLoading();
    try {
      const data = await fetchJson(params);
      if (requestId !== explorerRequest) return;
      explorerMeter.setData(data);
      updateShare(data, requestId);
    } catch (error) {
      if (requestId !== explorerRequest) return;
      explorerMeter.setError(error.message, loadExplorer);
    }
  };

  const initScope = async () => {
    syncScopeFields();
    const scope = currentScope();
    if (scope === 'municipio') await loadCities();
    if (scope === 'tributo') await loadTaxes();
    loadExplorer();
  };

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', async event => {
    const { name } = event.target;
    if (name === 'escopo') return initScope();
    if (name === 'uf' && currentScope() === 'municipio') await loadCities();
    if (name === 'esfera') await loadTaxes();
    loadExplorer();
  });

  /* ------------------------------------------------------ série histórica */

  const historyEl = document.getElementById('tax-history');
  let historySeries = null;
  let historyAnimated = false;
  // Ano em andamento: a barra cresce junto com o contador do topo.
  let liveYear = null;

  // Início e fim do ano no fuso de Brasília (UTC-3, sem horário de verão desde 2019).
  const yearBounds = year => ({
    start: Date.parse(`${year}-01-01T00:00:00-03:00`),
    end: Date.parse(`${year + 1}-01-01T00:00:00-03:00`)
  });

  const projectYearEnd = data => {
    const rate = Number(data.incrementoPorSegundo) || 0;
    const reference = Date.parse(data.referencia);
    if (!rate || !Number.isFinite(reference)) return null;
    const { end } = yearBounds(data.periodo.ano);
    return Number(data.valor) + rate * Math.max(0, (end - reference) / 1000);
  };

  function updateLiveYear(value) {
    if (!liveYear || !liveYear.fill.isConnected) return;
    const { fill, valueEl, cell, progressEl, progressBar, max, year } = liveYear;
    fill.style.width = `${Math.min(100, Math.max(1, (value / max) * 100)).toFixed(3)}%`;
    valueEl.textContent = brlInteger.format(value);
    cell.textContent = compactBRL(value, { short: true });
    const { start, end } = yearBounds(year);
    const now = acspMeter.serverClock
      ? acspMeter.serverClock.at + (performance.now() - acspMeter.serverClock.receivedAt)
      : Date.now();
    const elapsed = Math.min(1, Math.max(0, (now - start) / (end - start)));
    progressEl.textContent = percent.format(elapsed);
    progressBar.style.width = `${(elapsed * 100).toFixed(2)}%`;
  }

  const buildLiveStrip = (year, projection) => {
    const strip = document.createElement('div');
    strip.className = 'tax-history-live';

    const head = document.createElement('p');
    head.className = 'tax-history-live-head';
    const dot = document.createElement('span');
    dot.className = 'tax-history-live-dot';
    dot.setAttribute('aria-hidden', 'true');
    head.append(dot, document.createTextNode(`${year} em andamento`));

    const value = document.createElement('p');
    value.className = 'tax-history-live-value';
    value.textContent = '—';

    const progress = document.createElement('div');
    progress.className = 'tax-history-live-progress';
    const progressLabel = document.createElement('span');
    const progressValue = document.createElement('strong');
    progressLabel.append(progressValue, document.createTextNode(' do ano já decorrido'));
    const track = document.createElement('div');
    track.className = 'tax-history-live-track';
    track.setAttribute('aria-hidden', 'true');
    const trackFill = document.createElement('span');
    track.append(trackFill);
    progress.append(progressLabel, track);

    strip.append(head, value, progress);
    if (projection) {
      const note = document.createElement('p');
      note.className = 'tax-history-live-projection';
      const swatch = document.createElement('span');
      swatch.setAttribute('aria-hidden', 'true');
      note.append(swatch, document.createTextNode(`Projeção para 31/12 no ritmo atual: ${compactBRL(projection)}`));
      strip.append(note);
    }
    return { strip, valueEl: value, progressEl: progressValue, progressBar: trackFill };
  };

  const renderHistory = () => {
    if (!historySeries) return;
    const rows = historySeries.map(item => ({ ...item, partial: false }));
    const live = currentYearTotal?.periodo?.emAndamento && !rows.some(item => item.ano === currentYearTotal.periodo.ano);
    const projection = live ? projectYearEnd(currentYearTotal) : null;
    if (live) {
      rows.push({ ano: currentYearTotal.periodo.ano, valor: acspMeter.current() ?? currentYearTotal.valor, partial: true, projection });
    }
    const max = Math.max(...rows.map(item => Math.max(item.valor, item.projection || 0)));
    liveYear = null;

    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = 'Total de tributos arrecadados no Brasil por ano, em valores nominais';
    const tbody = document.createElement('tbody');
    let liveRefs = null;
    rows.slice().reverse().forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.style.setProperty('--row', index);
      if (item.partial) tr.className = 'is-partial';
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = item.ano;
      const barCell = document.createElement('td');
      const bar = document.createElement('div');
      bar.className = 'tax-history-bar';
      bar.setAttribute('aria-hidden', 'true');
      if (item.projection) {
        const ghost = document.createElement('span');
        ghost.className = 'tax-history-projection';
        ghost.style.width = `${Math.min(100, (item.projection / max) * 100).toFixed(2)}%`;
        bar.append(ghost);
      }
      const fill = document.createElement('span');
      fill.className = 'tax-history-fill';
      fill.style.width = `${Math.max(1, (item.valor / max) * 100).toFixed(2)}%`;
      bar.append(fill);
      barCell.append(bar);
      const valueCell = document.createElement('td');
      valueCell.className = 'tax-history-value';
      valueCell.textContent = compactBRL(item.valor, { short: true });
      valueCell.title = brlInteger.format(item.valor);
      if (item.partial) liveRefs = { fill, cell: valueCell };
      tr.append(th, barCell, valueCell);
      tbody.append(tr);
    });
    table.append(caption, tbody);
    // A entrada animada roda só na primeira renderização; as atualizações a cada 10 min não repetem.
    if (!historyAnimated) table.classList.add('is-entering');
    historyAnimated = true;

    const nodes = [];
    if (liveRefs) {
      const { strip, ...stripRefs } = buildLiveStrip(currentYearTotal.periodo.ano, projection);
      nodes.push(strip);
      liveYear = { ...liveRefs, ...stripRefs, max, year: currentYearTotal.periodo.ano };
    }
    nodes.push(table);
    if (liveRefs) {
      const note = document.createElement('p');
      note.className = 'tax-history-note';
      note.textContent = `* ${currentYearTotal.periodo.ano}: acumulado parcial, atualizado ao vivo com o contador da ACSP. A área tracejada é uma projeção linear até o fim do ano, não um dado oficial.`;
      nodes.push(note);
    }
    historyEl.replaceChildren(...nodes);
    historyEl.removeAttribute('aria-busy');
    const current = acspMeter.current();
    if (current !== null) updateLiveYear(current);
  };

  // As barras só começam a crescer quando a série entra na tela.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      historyEl.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: .2 });
    observer.observe(historyEl);
  } else {
    historyEl.classList.add('is-visible');
  }

  const loadHistory = async () => {
    historyEl.setAttribute('aria-busy', 'true');
    try {
      const body = await fetchJson({ lista: 'historico' });
      historySeries = body.serie;
      renderHistory();
    } catch (error) {
      const status = document.createElement('p');
      status.className = 'tax-history-status';
      status.textContent = `${error.message} `;
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Tentar novamente';
      retry.addEventListener('click', loadHistory);
      status.append(retry);
      historyEl.replaceChildren(status);
      historyEl.removeAttribute('aria-busy');
    }
  };

  /* ---------------------------------------------------------------- início */

  initFilters();
  refreshTopMeters();
  initScope();
  loadHistory();

  window.setInterval(() => {
    if (!document.hidden) refreshTopMeters();
  }, REFRESH_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (Date.now() - lastTopRefresh > REFRESH_MS) refreshTopMeters();
  });
})();
