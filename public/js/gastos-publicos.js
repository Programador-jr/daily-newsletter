(() => {
  'use strict';

  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const moneyCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
  const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const compactMoney = value => {
    const scales = [[1e12, 'tri'], [1e9, 'bi'], [1e6, 'mi'], [1e3, 'mil']];
    const found = scales.find(([scale]) => Math.abs(value) >= scale);
    return found ? 'R$ ' + decimal.format(value / found[0]) + ' ' + found[1] : money.format(value);
  };
  const byId = id => document.getElementById(id);
  const numberValue = (id, fallback = 0, min = -Infinity, max = Infinity) => {
    const input = byId(id);
    const value = Number(input?.value);
    if (!input || input.value === '' || !Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  };
  const setWidth = (id, share) => {
    const el = byId(id);
    if (el) el.style.width = Math.max(0, Math.min(100, share * 100)) + '%';
  };

  /* --------------------------------------- controles deslizantes (labs) */

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

  /* ------------------------------------------------- etapas da despesa */

  const stages = {
    empenho: {
      kicker: 'Compromisso orçamentário',
      body: 'Reserva do orçamento para uma obrigação identificada. Indica que há crédito comprometido, mas o bem ou serviço ainda pode não ter sido entregue.',
      question: 'Quanto do orçamento já foi comprometido?',
      where: '“Valor empenhado” nos portais de transparência; cada empenho tem número, favorecido e data.'
    },
    liquidacao: {
      kicker: 'Entrega verificada',
      body: 'Após verificar o direito do credor e a entrega do objeto, registra-se a liquidação. Ela antecede o pagamento.',
      question: 'Quanto do que foi contratado já foi entregue e conferido?',
      where: '“Valor liquidado”, normalmente ao lado do empenhado e do pago nas consultas por órgão ou programa.'
    },
    pagamento: {
      kicker: 'Desembolso realizado',
      body: 'Pagamento da obrigação liquidada. Restos a pagar e regras contábeis podem afetar a leitura por exercício financeiro.',
      question: 'Quanto dinheiro efetivamente saiu do caixa público?',
      where: '“Valor pago”, com a ordem bancária ao favorecido; pagamentos de anos anteriores aparecem como restos a pagar.'
    },
    resultado: {
      kicker: 'Serviço e impacto',
      body: 'Despesa paga não prova, por si só, que a política alcançou seus objetivos. Para avaliar resultado, consulte metas, entregas e indicadores.',
      question: 'A política entregou o que prometia, para quem precisava?',
      where: 'Relatórios de gestão, planos plurianuais, avaliações de programas e auditorias dos tribunais de contas.'
    }
  };
  const stageTabs = [...document.querySelectorAll('[data-stage]')];
  const stagePanel = byId('stage-panel');
  const selectStage = (tab, focus = false, animate = true) => {
    const stage = stages[tab.dataset.stage];
    if (!stage || !stagePanel) return;
    const index = stageTabs.indexOf(tab);
    stageTabs.forEach((item, position) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      item.classList.toggle('is-done', position < index);
    });
    if (focus) tab.focus();
    stagePanel.setAttribute('aria-labelledby', tab.id);
    stagePanel.parentElement.style.setProperty('--stage-progress', stageTabs.length > 1 ? index / (stageTabs.length - 1) : 0);
    byId('stage-kicker').textContent = stage.kicker;
    byId('stage-body').textContent = stage.body;
    byId('stage-question').textContent = stage.question;
    byId('stage-where').textContent = stage.where;
    stagePanel.classList.remove('is-changing');
    if (!animate) return;
    void stagePanel.offsetWidth;
    stagePanel.classList.add('is-changing');
  };
  stageTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStage(tab));
    tab.addEventListener('keydown', event => {
      const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        selectStage(stageTabs[event.key === 'Home' ? 0 : stageTabs.length - 1], true);
      } else if (offset) {
        event.preventDefault();
        selectStage(stageTabs[(index + offset + stageTabs.length) % stageTabs.length], true);
      }
    });
  });
  if (stageTabs[0]) selectStage(stageTabs[0], false, false);

  /* ------------------------------------------------- siga uma despesa */

  const updateFollow = () => {
    const committed = numberValue('follow-committed', 0, 0);
    const deliveredShare = numberValue('follow-delivered', 0, 0, 100) / 100;
    const paidShare = numberValue('follow-paid', 0, 0, 100) / 100;
    const liquidated = committed * deliveredShare;
    const paid = liquidated * paidShare;
    byId('follow-paid-value').textContent = moneyCents.format(paid);
    byId('follow-summary').textContent = committed === 0
      ? 'Informe um valor empenhado para começar.'
      : 'De ' + money.format(committed) + ' reservados, ' + money.format(liquidated) + ' correspondem a entregas conferidas e ' + money.format(paid) + ' já foram pagos.';
    const scale = committed || 1;
    setWidth('follow-bar-committed', committed ? 1 : 0);
    setWidth('follow-bar-liquidated', liquidated / scale);
    setWidth('follow-bar-paid', paid / scale);
    byId('follow-label-committed').textContent = compactMoney(committed);
    byId('follow-label-liquidated').textContent = compactMoney(liquidated);
    byId('follow-label-paid').textContent = compactMoney(paid);
    byId('follow-rate').textContent = committed ? percent.format(paid / committed) : '—';
    byId('follow-processed').textContent = compactMoney(liquidated - paid);
    byId('follow-unprocessed').textContent = compactMoney(committed - liquidated);
    byId('follow-pending').textContent = percent.format(1 - deliveredShare);
  };
  ['follow-committed', 'follow-delivered', 'follow-paid'].forEach(id => byId(id)?.addEventListener('input', () => {
    document.querySelectorAll('[data-follow-preset]').forEach(chip => chip.setAttribute('aria-pressed', 'false'));
    updateFollow();
  }));
  document.querySelectorAll('[data-follow-preset]').forEach(chip => chip.addEventListener('click', () => {
    const [delivered, paid] = chip.dataset.followPreset.split(',');
    [['follow-delivered', delivered], ['follow-paid', paid]].forEach(([id, value]) => {
      const input = byId(id);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.querySelectorAll('[data-follow-preset]').forEach(item => item.setAttribute('aria-pressed', String(item === chip)));
  }));
  updateFollow();

  /* ------------------------------------------------- classifique o gasto */

  const categoryLabels = {
    pessoal: 'Pessoal e previdência',
    servicos: 'Serviços públicos',
    investimentos: 'Investimentos',
    transferencias: 'Transferências e juros'
  };
  const quizItems = [
    ['Salário de professores de uma universidade federal', 'pessoal', 'Remuneração de servidores é despesa com pessoal, mesmo quando o servidor trabalha na educação.'],
    ['Construção de uma ponte em rodovia estadual', 'investimentos', 'Obras que criam ou ampliam patrimônio público são classificadas como investimento.'],
    ['Repasse do Fundo de Participação dos Municípios (FPM)', 'transferencias', 'O FPM é uma transferência constitucional da União aos municípios; quem gasta o dinheiro é a prefeitura.'],
    ['Contrato de merenda escolar na rede municipal', 'servicos', 'É custeio de uma política pública em funcionamento: o serviço de educação.'],
    ['Pagamento de juros da dívida pública', 'transferencias', 'Juros e encargos da dívida têm natureza própria e não entram no resultado primário.'],
    ['Compra de ambulâncias para a rede de saúde', 'investimentos', 'Equipamentos e veículos duráveis entram como investimento (aquisição de material permanente).'],
    ['Aposentadorias de servidores públicos', 'pessoal', 'Benefícios previdenciários de servidores aparecem junto às despesas de pessoal e previdência.'],
    ['Manutenção e limpeza de postos de saúde', 'servicos', 'Despesas para manter um serviço funcionando são custeio da área de saúde.']
  ];
  const quiz = { index: 0, score: 0, answered: false };
  const quizButtons = [...document.querySelectorAll('[data-quiz-answer]')];
  const quizFeedback = byId('quiz-feedback');
  const renderQuiz = () => {
    const [question] = quizItems[quiz.index];
    byId('quiz-progress').textContent = 'Exemplo ' + (quiz.index + 1) + ' de ' + quizItems.length;
    byId('quiz-score').textContent = quiz.score + (quiz.score === 1 ? ' acerto' : ' acertos');
    byId('quiz-bar').style.width = (quiz.index / quizItems.length * 100) + '%';
    byId('quiz-question').textContent = question;
    quizButtons.forEach(button => {
      button.disabled = false;
      button.removeAttribute('data-result');
    });
    quizFeedback.hidden = true;
    byId('quiz-next').hidden = true;
    byId('quiz-restart').hidden = true;
    quiz.answered = false;
  };
  quizButtons.forEach(button => button.addEventListener('click', () => {
    if (quiz.answered) return;
    quiz.answered = true;
    const [, answer, reason] = quizItems[quiz.index];
    const correct = button.dataset.quizAnswer === answer;
    if (correct) quiz.score++;
    quizButtons.forEach(item => {
      item.disabled = true;
      if (item.dataset.quizAnswer === answer) item.dataset.result = 'correct';
      else if (item === button) item.dataset.result = 'wrong';
    });
    quizFeedback.hidden = false;
    quizFeedback.dataset.result = correct ? 'correct' : 'wrong';
    quizFeedback.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = correct ? 'Correto.' : 'Não exatamente: a resposta é ' + categoryLabels[answer] + '.';
    quizFeedback.append(title, document.createTextNode(' ' + reason));
    byId('quiz-score').textContent = quiz.score + (quiz.score === 1 ? ' acerto' : ' acertos');
    const last = quiz.index === quizItems.length - 1;
    byId('quiz-bar').style.width = ((quiz.index + 1) / quizItems.length * 100) + '%';
    if (last) {
      const final = document.createElement('p');
      final.textContent = 'Você acertou ' + quiz.score + ' de ' + quizItems.length + '.';
      quizFeedback.append(final);
      byId('quiz-restart').hidden = false;
      byId('quiz-restart').focus();
    } else {
      byId('quiz-next').hidden = false;
      byId('quiz-next').focus();
    }
  }));
  byId('quiz-next')?.addEventListener('click', () => {
    quiz.index++;
    renderQuiz();
    quizButtons[0]?.focus();
  });
  byId('quiz-restart')?.addEventListener('click', () => {
    Object.assign(quiz, { index: 0, score: 0 });
    renderQuiz();
    quizButtons[0]?.focus();
  });
  if (quizButtons.length) renderQuiz();

  /* -------------------------------------------- comparação por habitante */

  const renderCompareBars = (container, entries, format) => {
    const max = Math.max(1, ...entries.map(entry => entry.value));
    container.replaceChildren(...entries.map((entry, index) => {
      const row = document.createElement('div');
      row.className = 'spend-compare-bar' + (index ? ' is-second' : '');
      const label = document.createElement('small');
      label.textContent = entry.name;
      const track = document.createElement('span');
      track.className = 'spend-compare-track';
      const fill = document.createElement('span');
      fill.style.width = (entry.value / max * 100) + '%';
      track.append(fill);
      const value = document.createElement('b');
      value.textContent = format(entry.value);
      row.append(label, track, value);
      return row;
    }));
  };
  const updatePerCapita = () => {
    const entity = key => ({
      name: byId('pc-' + key + '-name')?.value.trim() || (key === 'a' ? 'Ente A' : 'Ente B'),
      total: numberValue('pc-' + key + '-total', 0, 0),
      population: numberValue('pc-' + key + '-pop', 1, 1)
    });
    const a = entity('a'), b = entity('b');
    a.capita = a.total / a.population;
    b.capita = b.total / b.population;
    renderCompareBars(byId('pc-total-bars'), [{ name: a.name, value: a.total }, { name: b.name, value: b.total }], compactMoney);
    renderCompareBars(byId('pc-capita-bars'), [{ name: a.name, value: a.capita }, { name: b.name, value: b.capita }], value => moneyCents.format(value));
    const verdict = byId('pc-verdict');
    if (!a.total || !b.total) {
      verdict.textContent = 'Informe os gastos dos dois entes para comparar.';
      return;
    }
    const [high, low] = a.capita >= b.capita ? [a, b] : [b, a];
    const [bigger] = a.total >= b.total ? [a, b] : [b, a];
    const ratio = low.capita ? high.capita / low.capita : 0;
    let text = high.name + ' gasta ' + moneyCents.format(high.capita) + ' por habitante, ' + (ratio && Math.abs(ratio - 1) > .005 ? decimal.format(ratio) + ' vez(es) o valor de ' + low.name + '.' : 'praticamente o mesmo que ' + low.name + '.');
    if (bigger !== high && Math.abs(ratio - 1) > .005) text += ' Repare: ' + bigger.name + ' tem o maior gasto total, mas não o maior gasto por pessoa.';
    text += ' Por dia, isso equivale a ' + moneyCents.format(high.capita / 365) + ' por habitante, se o período for de um ano.';
    verdict.textContent = text;
  };
  ['pc-a-name', 'pc-a-total', 'pc-a-pop', 'pc-b-name', 'pc-b-total', 'pc-b-pop'].forEach(id => byId(id)?.addEventListener('input', updatePerCapita));
  updatePerCapita();
})();
