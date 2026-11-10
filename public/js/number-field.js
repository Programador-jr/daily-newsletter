/**
 * Campos numéricos com botões ▲/▼ próprios (o visual vem de components.css).
 *
 * Envolve cada <input type="number"> dentro de <main> em <span class="number-field">
 * e acrescenta os botões. O input continua sendo o controle: teclado, setas e
 * leitores de tela usam o campo nativo; os botões só chamam stepUp/stepDown e
 * disparam `input` e `change`, como uma digitação. Campos criados depois (por
 * exemplo, novas linhas de uma tabela) também são aprimorados.
 */
(() => {
  'use strict';

  const enhanced = new WeakSet();
  const HOLD_DELAY = 400;
  const HOLD_INTERVAL = 70;

  const step = (input, direction) => {
    if (input.disabled || input.readOnly) return;
    const before = input.value;
    try {
      if (input.value === '') input.value = input.min !== '' ? input.min : '0';
      else if (direction > 0) input.stepUp();
      else input.stepDown();
    } catch {
      // step="any" não aceita stepUp/stepDown: soma 1 manualmente.
      const value = Number(input.value) || 0;
      input.value = String(value + direction);
    }
    if (input.value === before) return;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const makeButton = (input, direction) => {
    const button = document.createElement('button');
    button.type = 'button';
    // O campo já responde às setas do teclado; os botões ficam fora da ordem de foco.
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    const icon = document.createElement('i');
    icon.className = `fas fa-chevron-${direction > 0 ? 'up' : 'down'}`;
    button.append(icon);

    // Segurar o botão repete o passo.
    let delay = null;
    let repeat = null;
    const stop = () => {
      window.clearTimeout(delay);
      window.clearInterval(repeat);
      delay = repeat = null;
    };
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      step(input, direction);
      delay = window.setTimeout(() => {
        repeat = window.setInterval(() => step(input, direction), HOLD_INTERVAL);
      }, HOLD_DELAY);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => button.addEventListener(type, stop));
    return button;
  };

  const enhance = input => {
    if (enhanced.has(input) || input.closest('.number-field')) return;
    enhanced.add(input);
    const wrapper = document.createElement('span');
    wrapper.className = 'number-field';
    const steps = document.createElement('span');
    steps.className = 'number-field-steps';
    steps.append(makeButton(input, 1), makeButton(input, -1));
    input.before(wrapper);
    wrapper.append(input, steps);
  };

  const scan = root => {
    if (root.matches?.('input[type="number"]')) enhance(root);
    root.querySelectorAll?.('input[type="number"]').forEach(enhance);
  };

  const start = () => {
    const main = document.querySelector('main') || document.body;
    scan(main);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) scan(node);
    }))).observe(main, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  window.KingsNumberField = { enhance: scan };
})();
