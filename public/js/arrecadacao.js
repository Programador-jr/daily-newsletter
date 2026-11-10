/**
 * Arrecadação — exemplos interativos:
 * 1. repartição constitucional de tributos;
 * 2. receita prevista na LOA × arrecadada;
 * 3. resultado primário, nominal e dívida.
 */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const percent = value => decimal.format(value) + '%';
  const read = (id, fallback = 0, min = -Infinity, max = Infinity) => {
    const input = byId(id);
    const value = Number(input?.value);
    if (!input || input.value === '' || !Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const setPressed = (selector, active) => document.querySelectorAll(selector)
    .forEach(button => button.setAttribute('aria-pressed', String(button === active)));

  // Controles deslizantes espelham o campo numérico (data-sync).
  document.querySelectorAll('input[type="range"][data-sync]').forEach(range => {
    const target = byId(range.dataset.sync);
    if (!target) return;
    const paint = () => {
      const min = Number(range.min), max = Number(range.max);
      range.style.setProperty('--fill', ((Number(range.value) - min) / (max - min) * 100) + '%');
    };
    range.addEventListener('input', () => {
      target.value = range.value;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      paint();
    });
    target.addEventListener('input', () => {
      if (target.value !== '' && Number.isFinite(Number(target.value))) range.value = target.value;
      paint();
    });
    paint();
  });

  /* ------------------------------------------------ 1. repartição de tributos */

  // Partes em % do valor arrecadado. group: uniao | estado | municipio | regional.
  const TAXES = {
    ir: {
      name: 'Imposto de Renda (IR)',
      collector: 'União',
      basis: 'CF, art. 159, I (FPE, FPM e fundos regionais)',
      shares: [
        ['União', 'uniao', 50],
        ['Estados e DF · FPE', 'estado', 21.5],
        ['Municípios · FPM', 'municipio', 25.5],
        ['Fundos regionais (FNO, FNE, FCO)', 'regional', 3]
      ],
      note: 'O IR retido na fonte sobre salários pagos por estados e municípios pertence ao próprio ente (arts. 157 e 158) e não entra nesta divisão. Simplificado: não mostra a destinação de parte dos fundos ao Fundeb.'
    },
    ipi: {
      name: 'Imposto sobre Produtos Industrializados (IPI)',
      collector: 'União',
      basis: 'CF, art. 159, I e II, e § 3º',
      shares: [
        ['União', 'uniao', 40],
        ['Estados e DF · FPE', 'estado', 21.5],
        ['Municípios · FPM', 'municipio', 25.5],
        ['Fundos regionais (FNO, FNE, FCO)', 'regional', 3],
        ['Estados exportadores · IPI-Exportação', 'estado', 7.5],
        ['Municípios desses estados', 'municipio', 2.5]
      ],
      note: 'Os 10% do IPI-Exportação vão aos estados proporcionalmente às exportações de produtos industrializados, que repassam 25% aos municípios. A reforma tributária (EC 132/2023) prevê reduzir o IPI a zero, salvo para produtos com industrialização incentivada na Zona Franca de Manaus.'
    },
    icms: {
      name: 'Imposto sobre Circulação de Mercadorias e Serviços (ICMS)',
      collector: 'Estados e DF',
      basis: 'CF, art. 158, IV',
      shares: [
        ['Estado', 'estado', 75],
        ['Municípios do estado', 'municipio', 25]
      ],
      note: 'A cota dos municípios é dividida principalmente pelo valor adicionado em cada território e, em parte, por critérios de lei estadual, incluindo indicadores de educação. Pela reforma tributária, o ICMS será substituído gradualmente pelo IBS até 2033.'
    },
    ipva: {
      name: 'Imposto sobre a Propriedade de Veículos Automotores (IPVA)',
      collector: 'Estados e DF',
      basis: 'CF, art. 158, III',
      shares: [
        ['Estado', 'estado', 50],
        ['Município onde o veículo é licenciado', 'municipio', 50]
      ],
      note: 'Metade do IPVA fica com o estado e metade vai para o município em que o veículo foi licenciado.'
    },
    itr: {
      name: 'Imposto Territorial Rural (ITR)',
      collector: 'União',
      basis: 'CF, art. 158, II, e art. 153, § 4º, III',
      shares: [
        ['União', 'uniao', 50],
        ['Município onde fica o imóvel', 'municipio', 50]
      ],
      sharesConvenio: [
        ['Município onde fica o imóvel', 'municipio', 100]
      ],
      note: 'O município pode ficar com 100% do ITR se optar, na forma da lei, por fiscalizar e cobrar o imposto, sem reduzi-lo nem conceder renúncia fiscal.'
    },
    iof: {
      name: 'IOF sobre o ouro como ativo financeiro (IOF-ouro)',
      collector: 'União',
      basis: 'CF, art. 153, § 5º',
      shares: [
        ['Estado de origem do ouro', 'estado', 30],
        ['Município de origem do ouro', 'municipio', 70]
      ],
      note: 'Embora seja um imposto federal, todo o IOF-ouro é transferido: 30% ao estado e 70% ao município de origem do ouro.'
    }
  };
  const GROUP_LABEL = { uniao: 'União', estado: 'Estados', municipio: 'Municípios', regional: 'Fundos regionais' };
  const split = { tax: 'ir', convenio: false };

  const renderSplit = () => {
    const tax = TAXES[split.tax];
    if (!tax || !byId('split-bar')) return;
    const value = read('split-value', 0, 0);
    const shares = split.tax === 'itr' && split.convenio ? tax.sharesConvenio : tax.shares;
    const totals = shares.reduce((sum, [, group, share]) => ({ ...sum, [group]: (sum[group] || 0) + share }), {});
    const collectorGroup = { 'União': 'uniao', 'Estados e DF': 'estado' }[tax.collector];
    const kept = totals[collectorGroup] || 0;

    byId('split-name').textContent = `Fica com ${collectorGroup === 'uniao' ? 'a União' : 'o estado'}`;
    byId('split-collector').textContent = tax.collector;
    byId('split-basis').textContent = tax.basis;
    byId('split-kept').textContent = money.format(value * kept / 100);
    byId('split-summary').textContent = kept >= 100
      ? `${tax.name}: todo o valor fica com quem arrecada.`
      : kept <= 0
        ? `${tax.name}: ${tax.collector === 'União' ? 'a União arrecada' : tax.collector + ' arrecadam'} ${money.format(value)}, mas repassa${tax.collector === 'União' ? '' : 'm'} tudo a outros entes.`
        : `${tax.name}: de ${money.format(value)} arrecadados, ${percent(100 - kept)} (${money.format(value * (100 - kept) / 100)}) vão para outros entes.`;
    byId('split-itr-option').hidden = split.tax !== 'itr';

    byId('split-bar').replaceChildren(...shares.map(([label, group, share]) => {
      const segment = element('span', `arrec-stack-part is-${group}`);
      segment.style.flexGrow = String(share);
      segment.title = `${label}: ${percent(share)}`;
      if (share >= 9) segment.textContent = percent(share);
      return segment;
    }));
    byId('split-legend').replaceChildren(...shares.map(([label, group, share]) => {
      const item = element('li', `is-${group}`);
      const swatch = element('i', 'arrec-swatch');
      swatch.setAttribute('aria-hidden', 'true');
      const name = element('span', 'arrec-legend-name', label);
      // A etiqueta do grupo só aparece quando acrescenta informação.
      if (!label.startsWith(GROUP_LABEL[group])) name.append(element('small', '', GROUP_LABEL[group]));
      item.append(swatch, name, element('b', '', `${money.format(value * share / 100)} · ${percent(share)}`));
      return item;
    }));
    byId('split-note').textContent = tax.note;
  };

  document.querySelectorAll('[data-tax]').forEach(button => button.addEventListener('click', () => {
    split.tax = button.dataset.tax;
    setPressed('[data-tax]', button);
    renderSplit();
  }));
  document.querySelectorAll('[data-itr]').forEach(button => button.addEventListener('click', () => {
    split.convenio = button.dataset.itr === 'yes';
    setPressed('[data-itr]', button);
    renderSplit();
  }));
  byId('split-value')?.addEventListener('input', renderSplit);
  renderSplit();

  /* ------------------------------------------- 2. previsto na LOA × arrecadado */

  const millions = value => `R$ ${decimal.format(value)} mi`;
  const renderForecast = () => {
    if (!byId('forecast-share')) return;
    const planned = read('forecast-planned', 1, 1);
    const collected = read('forecast-collected', 0, 0);
    const months = Math.round(read('forecast-months', 1, 1, 12));
    const share = collected / planned * 100;
    const expected = months / 12 * 100;
    const projection = collected / months * 12;
    const gap = projection - planned;
    const ahead = share >= expected;

    byId('forecast-share').textContent = percent(share);
    byId('forecast-summary').textContent = `Depois de ${months} ${months === 1 ? 'mês' : 'meses'}, o esperado num ritmo constante seria ${percent(expected)} da previsão. A arrecadação está ${ahead ? 'acima' : 'abaixo'} desse ritmo.`;
    byId('forecast-bar').style.width = Math.min(100, share) + '%';
    byId('forecast-expected').style.left = expected + '%';
    byId('forecast-expected-label').textContent = `Esperado em ${months} ${months === 1 ? 'mês' : 'meses'}: ${percent(expected)}`;
    byId('forecast-projection').textContent = millions(projection);
    byId('forecast-gap').textContent = (gap >= 0 ? '+' : '−') + millions(Math.abs(gap));
    byId('forecast-gap').dataset.direction = gap >= 0 ? 'up' : 'down';
    byId('forecast-gap-note').textContent = gap >= 0 ? 'excesso de arrecadação projetado' : 'frustração de receita projetada';
    byId('forecast-monthly').textContent = millions(collected / months);
    byId('forecast-needed').textContent = months >= 12
      ? (collected >= planned ? 'Meta atingida' : 'Ano encerrado')
      : millions(Math.max(0, planned - collected) / (12 - months));
    byId('forecast-share').closest('.lab-result-panel').dataset.state = ahead ? 'ahead' : 'behind';
  };
  ['forecast-planned', 'forecast-collected', 'forecast-months'].forEach(id => byId(id)?.addEventListener('input', renderForecast));
  renderForecast();

  /* ------------------------------------------------ 3. resultado fiscal */

  const billions = value => `R$ ${decimal.format(value)} bi`;
  const signed = value => (value > 0 ? '+' : value < 0 ? '−' : '') + billions(Math.abs(value));
  const renderFiscal = () => {
    if (!byId('fiscal-nominal')) return;
    const revenue = read('fiscal-revenue', 0, 0);
    const spending = read('fiscal-spending', 0, 0);
    const interest = read('fiscal-interest', 0, 0);
    const debt = read('fiscal-debt', 0, 0);
    const primary = revenue - spending;
    const nominal = primary - interest;
    const debtEnd = Math.max(0, debt - nominal);

    byId('fiscal-primary').textContent = signed(primary);
    byId('fiscal-primary').dataset.direction = primary >= 0 ? 'up' : 'down';
    byId('fiscal-primary-note').textContent = primary >= 0 ? 'superávit primário' : 'déficit primário';
    byId('fiscal-nominal').textContent = `${signed(nominal)} · ${nominal >= 0 ? 'superávit' : 'déficit'}`;
    byId('fiscal-nominal').closest('.lab-result-panel').dataset.state = nominal >= 0 ? 'surplus' : 'deficit';
    byId('fiscal-summary').textContent = primary >= 0 && nominal < 0
      ? `As receitas cobrem as despesas primárias, mas não os juros: faltam ${billions(-nominal)}, que viram mais dívida.`
      : nominal >= 0
        ? `Sobram ${billions(nominal)} depois de pagar despesas e juros; esse valor pode reduzir a dívida.`
        : `Faltam recursos até para as despesas primárias; somando os juros, o déficit chega a ${billions(-nominal)}.`;
    byId('fiscal-interest-out').textContent = billions(interest);
    byId('fiscal-debt-end').textContent = billions(debtEnd);
    const change = debtEnd - debt;
    byId('fiscal-debt-change').textContent = signed(change);
    byId('fiscal-debt-change').dataset.direction = change > 0 ? 'down' : 'up';
    byId('fiscal-debt-change-note').textContent = debt ? `${change >= 0 ? '+' : '−'}${percent(Math.abs(change) / debt * 100)} sobre o estoque inicial` : '—';

    const max = Math.max(1, revenue, spending + interest);
    const bar = (label, parts) => {
      const row = element('div', 'arrec-fiscal-row');
      const track = element('span', 'arrec-fiscal-track');
      parts.forEach(([value, className]) => {
        const part = element('span', className);
        part.style.width = (value / max * 100) + '%';
        track.append(part);
      });
      row.append(element('small', '', label), track, element('b', '', billions(parts.reduce((sum, [value]) => sum + value, 0))));
      return row;
    };
    byId('fiscal-bars').replaceChildren(
      bar('Receitas', [[revenue, 'is-revenue']]),
      bar('Despesas + juros', [[spending, 'is-spending'], [interest, 'is-interest']])
    );
  };
  ['fiscal-revenue', 'fiscal-spending', 'fiscal-interest', 'fiscal-debt'].forEach(id => byId(id)?.addEventListener('input', () => {
    setPressed('[data-fiscal-preset]', null);
    renderFiscal();
  }));
  document.querySelectorAll('[data-fiscal-preset]').forEach(button => button.addEventListener('click', () => {
    const values = button.dataset.fiscalPreset.split(',');
    ['fiscal-revenue', 'fiscal-spending', 'fiscal-interest', 'fiscal-debt'].forEach((id, index) => { byId(id).value = values[index]; });
    setPressed('[data-fiscal-preset]', button);
    renderFiscal();
  }));
  renderFiscal();
})();
