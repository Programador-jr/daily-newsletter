(() => {
  'use strict';

  const API = '/api/gastometro';
  const REFRESH_MS = 10 * 60 * 1000;
  const { LiveMeter, createApiClient, format } = window.KingsLiveCounter;
  const { compactBRL, percent } = format;
  const { fetchJson, fetchCached } = createApiClient(API);

  // Código IBGE, nome e capital (código IBGE do município) de cada UF.
  const UFS = {
    ac: [12, 'Acre', 1200401], al: [27, 'Alagoas', 2704302], am: [13, 'Amazonas', 1302603],
    ap: [16, 'Amapá', 1600303], ba: [29, 'Bahia', 2927408], ce: [23, 'Ceará', 2304400],
    df: [53, 'Distrito Federal', 5300108], es: [32, 'Espírito Santo', 3205309], go: [52, 'Goiás', 5208707],
    ma: [21, 'Maranhão', 2111300], mg: [31, 'Minas Gerais', 3106200], ms: [50, 'Mato Grosso do Sul', 5002704],
    mt: [51, 'Mato Grosso', 5103403], pa: [15, 'Pará', 1501402], pb: [25, 'Paraíba', 2507507],
    pe: [26, 'Pernambuco', 2611606], pi: [22, 'Piauí', 2211001], pr: [41, 'Paraná', 4106902],
    rj: [33, 'Rio de Janeiro', 3304557], rn: [24, 'Rio Grande do Norte', 2408102], ro: [11, 'Rondônia', 1100205],
    rr: [14, 'Roraima', 1400100], rs: [43, 'Rio Grande do Sul', 4314902], sc: [42, 'Santa Catarina', 4205407],
    se: [28, 'Sergipe', 2800308], sp: [35, 'São Paulo', 3550308], to: [17, 'Tocantins', 1721000]
  };
  const SPHERE_COLORS = { 1: 'var(--spend-uniao)', 2: 'var(--spend-estados)', 3: 'var(--spend-municipios)' };
  const SPHERE_NAMES = { 1: 'União', 2: 'Estados e DF', 3: 'Municípios' };

  let overview = null;
  let lastRefresh = 0;

  /* ------------------------------------------------------ visão nacional */

  const totalMeter = new LiveMeter(document.getElementById('meter-total'));
  const sphereMeters = new Map();
  document.querySelectorAll('[data-sphere]').forEach(card => {
    const shareEl = card.querySelector('[data-share]');
    const meter = new LiveMeter(card, {
      onRender: value => {
        const total = totalMeter.current();
        if (total) shareEl.textContent = `${percent.format(value / total)} do gasto público total`;
      }
    });
    sphereMeters.set(Number(card.dataset.sphere), meter);
  });
  const pensionCard = document.getElementById('meter-pension');
  const pensionMeter = new LiveMeter(pensionCard);

  const withSnapshot = (counter, body) => ({
    ...counter,
    referencia: body.referencia,
    consultadoEm: body.consultadoEm,
    emAndamento: body.emAndamento,
    periodo: body.periodo,
    desatualizado: body.desatualizado
  });

  const renderComposition = body => {
    const container = document.getElementById('spend-composition');
    const spheres = body.entes.filter(ente => ente.codigo >= 1 && ente.codigo <= 3);
    const sum = spheres.reduce((total, ente) => total + ente.valor, 0);
    if (!sum) return;

    const bar = container.querySelector('.spend-composition-bar');
    const legend = container.querySelector('.spend-composition-legend');
    bar.replaceChildren(...spheres.map(ente => {
      const segment = document.createElement('span');
      segment.style.width = `${((ente.valor / sum) * 100).toFixed(2)}%`;
      segment.style.background = SPHERE_COLORS[ente.codigo];
      return segment;
    }));
    legend.replaceChildren(...spheres.map(ente => {
      const item = document.createElement('li');
      const swatch = document.createElement('i');
      swatch.style.background = SPHERE_COLORS[ente.codigo];
      swatch.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = SPHERE_NAMES[ente.codigo];
      const share = document.createElement('strong');
      share.textContent = percent.format(ente.valor / sum);
      item.append(swatch, name, share);
      return item;
    }));
    container.hidden = false;
  };

  const renderPensionShare = body => {
    const share = body.previdencia?.participacao;
    const box = pensionCard.querySelector('[data-pension-share]');
    if (!Number.isFinite(share)) {
      box.hidden = true;
      return;
    }
    pensionCard.querySelector('[data-pension-percent]').textContent = percent.format(share);
    pensionCard.querySelector('.spend-ring').style.setProperty('--share', String(Math.min(1, Math.max(0, share))));
    box.hidden = false;
  };

  const allOverviewMeters = () => [totalMeter, ...sphereMeters.values(), pensionMeter];

  const loadOverview = async () => {
    lastRefresh = Date.now();
    if (!overview) allOverviewMeters().forEach(meter => meter.setLoading());
    try {
      const body = await fetchJson({});
      overview = body;
      const byCode = new Map(body.entes.map(ente => [ente.codigo, ente]));
      totalMeter.setData(withSnapshot(byCode.get(0), body));
      sphereMeters.forEach((meter, code) => {
        const ente = byCode.get(code);
        if (ente) meter.setData(withSnapshot(ente, body));
        else meter.setError('Sem dados para esta esfera.');
      });
      if (body.previdencia) {
        pensionMeter.setData(withSnapshot(body.previdencia, body));
        renderPensionShare(body);
      } else {
        pensionMeter.setError('Sem dados de previdência no momento.');
      }
      renderComposition(body);
      renderExplorerFacts();
    } catch (error) {
      // Numa atualização periódica, mantém os contadores projetados em vez de apagá-los.
      if (!overview) allOverviewMeters().forEach(meter => meter.setError(error.message, loadOverview));
    }
  };

  /* ------------------------------------------------------------ explorador */

  const form = document.getElementById('explorer-form');
  const ufSelect = document.getElementById('explorer-uf');
  const citySelect = document.getElementById('explorer-city');
  const explorerCard = document.getElementById('meter-explorer');
  const explorerMeter = new LiveMeter(explorerCard);
  const explorerKind = explorerCard.querySelector('[data-explorer-kind]');
  const explorerTitle = explorerCard.querySelector('[data-explorer-title]');
  const factsEl = explorerCard.querySelector('[data-explorer-facts]');
  const powersEl = explorerCard.querySelector('[data-explorer-powers]');
  let explorerRequest = 0;
  let explorerData = null;

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

  const syncScopeFields = () => {
    form.querySelector('[data-filter="municipio"]').hidden = currentScope() !== 'municipio';
    form.querySelectorAll('.tax-meter-scope label').forEach(label => {
      label.classList.toggle('is-active', label.querySelector('input').checked);
    });
  };

  const loadCities = async () => {
    const [ufCode, , capital] = UFS[ufSelect.value];
    citySelect.disabled = true;
    fillSelect(citySelect, [{ value: '', label: 'Carregando…' }], '');
    try {
      const body = await fetchCached({ lista: 'municipios', uf: String(ufCode) });
      const options = body.municipios
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .map(item => ({ value: String(item.codigo), label: item.nome, meta: item.codigo === capital ? 'capital' : '' }));
      const preferred = options.some(item => item.value === String(capital)) ? String(capital) : options[0]?.value;
      fillSelect(citySelect, options, preferred);
      citySelect.disabled = !options.length;
    } catch {
      fillSelect(citySelect, [{ value: '', label: 'Lista indisponível' }], '');
    }
  };

  const fact = (label, value) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = label;
    const amount = document.createElement('strong');
    amount.textContent = value;
    item.append(name, amount);
    return item;
  };

  /** Fatos comparativos: dependem também da visão nacional, que pode chegar depois. */
  const renderExplorerFacts = () => {
    if (!explorerData) return;
    const items = [];
    const { previdencia, ente } = explorerData;

    if (previdencia && Number.isFinite(previdencia.participacao)) {
      items.push(fact('Previdência', `${compactBRL(previdencia.valor)} · ${percent.format(previdencia.participacao)} do gasto`));
    }
    if (overview) {
      const aggregateCode = ente.tipo === 'estado' ? 2 : 3;
      const aggregate = overview.entes.find(item => item.codigo === aggregateCode);
      if (aggregate?.valor) {
        const scope = ente.tipo === 'estado' ? 'de todos os estados e do DF' : 'de todos os municípios';
        items.push(fact('Participação', `${percent.format(explorerData.valor / aggregate.valor)} do gasto ${scope}`));
      }
    }

    factsEl.replaceChildren(...items);
    factsEl.hidden = !items.length;
  };

  const renderPowers = powers => {
    const tbody = powersEl.querySelector('tbody');
    if (!Array.isArray(powers) || !powers.length) {
      powersEl.hidden = true;
      return;
    }
    const max = Math.max(...powers.map(power => power.valor));
    tbody.replaceChildren(...powers.map(power => {
      const row = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      name.textContent = power.nome;
      const barCell = document.createElement('td');
      const bar = document.createElement('div');
      bar.className = 'tax-history-bar';
      bar.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.style.width = `${Math.max(1, (power.valor / max) * 100).toFixed(2)}%`;
      bar.append(fill);
      barCell.append(bar);
      const value = document.createElement('td');
      value.className = 'tax-history-value';
      value.textContent = compactBRL(power.valor, { short: true });
      row.append(name, barCell, value);
      return row;
    }));
    powersEl.hidden = false;
  };

  const loadExplorer = async () => {
    const requestId = ++explorerRequest;
    const scope = currentScope();
    const [ufCode, ufName] = UFS[ufSelect.value];
    const code = scope === 'municipio' ? citySelect.value : String(ufCode);

    explorerKind.textContent = scope === 'municipio' ? 'Município' : 'Estado';
    explorerTitle.textContent = scope === 'municipio'
      ? `${citySelect.selectedOptions[0]?.textContent || ''} (${ufSelect.value.toUpperCase()})`
      : ufName;
    explorerData = null;
    factsEl.hidden = true;
    powersEl.hidden = true;

    if (!code) {
      explorerMeter.setError('Não foi possível carregar a lista de municípios.', initScope);
      return;
    }

    explorerMeter.setLoading();
    try {
      const body = await fetchJson({ ente: code });
      if (requestId !== explorerRequest) return;
      explorerData = body;
      explorerMeter.setData(body);
      renderExplorerFacts();
      renderPowers(body.pessoalPorPoder);
    } catch (error) {
      if (requestId !== explorerRequest) return;
      explorerMeter.setError(error.message, loadExplorer);
    }
  };

  async function initScope() {
    syncScopeFields();
    if (currentScope() === 'municipio') await loadCities();
    loadExplorer();
  }

  fillSelect(ufSelect, Object.entries(UFS)
    .sort((a, b) => a[1][1].localeCompare(b[1][1], 'pt-BR'))
    .map(([sigla, [, name]]) => ({ value: sigla, label: name, meta: sigla.toUpperCase() })), 'sp');
  window.KingsOptionPicker?.enhance(form);

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', async event => {
    const { name } = event.target;
    if (name === 'escopo') return initScope();
    if (name === 'uf' && currentScope() === 'municipio') await loadCities();
    loadExplorer();
  });

  /* ---------------------------------------------------------------- início */

  loadOverview();
  initScope();

  window.setInterval(() => {
    if (!document.hidden) loadOverview();
  }, REFRESH_MS);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastRefresh > REFRESH_MS) loadOverview();
  });
})();
