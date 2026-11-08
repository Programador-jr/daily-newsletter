/**
 * Base compartilhada dos contadores em tempo real (Impostômetro e Gastômetro):
 * formatação em reais, cliente da API local e o contador animado.
 *
 * Contrato de dados aceito por LiveMeter.setData:
 *   { valor, incrementoPorSegundo, referencia, consultadoEm, emAndamento,
 *     periodo: { ano }, desatualizado? }
 */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TICK_MS = reducedMotion ? 1000 : 100;
  const TIME_ZONE = 'America/Sao_Paulo';

  /* ------------------------------------------------------------ formatação */

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brlInteger = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });
  const clock = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: TIME_ZONE });

  const compactBRL = (value, { short = false } = {}) => {
    const scales = [
      [1e12, short ? 'tri' : 'trilhões', short ? 'tri' : 'trilhão'],
      [1e9, short ? 'bi' : 'bilhões', short ? 'bi' : 'bilhão'],
      [1e6, short ? 'mi' : 'milhões', short ? 'mi' : 'milhão'],
      [1e3, 'mil', 'mil']
    ];
    for (const [scale, plural, singular] of scales) {
      if (Math.abs(value) >= scale) {
        const scaled = value / scale;
        return `R$ ${decimal.format(scaled)} ${scaled >= 2 ? plural : singular}`;
      }
    }
    return brl.format(value);
  };

  const brasiliaYear = () => Number(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric' }).format(new Date()));

  /* ----------------------------------------------------------------- API */

  const createApiClient = base => {
    const responseCache = new Map();

    const fetchJson = async params => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(query ? `${base}?${query}` : base, { headers: { Accept: 'application/json' } });
      let body = null;
      try { body = await response.json(); } catch { /* corpo inválido tratado abaixo */ }
      if (!response.ok) throw new Error(body?.erro || 'Fonte indisponível no momento.');
      if (!body) throw new Error('Resposta inválida.');
      return body;
    };

    // Listas e períodos fechados não mudam durante a visita; reaproveita a resposta.
    const fetchCached = params => {
      const key = new URLSearchParams(params).toString();
      if (!responseCache.has(key)) {
        const pending = fetchJson(params).catch(error => {
          responseCache.delete(key);
          throw error;
        });
        responseCache.set(key, pending);
      }
      return responseCache.get(key);
    };

    return { fetchJson, fetchCached };
  };

  /* ----------------------------------------------------- contador ao vivo */

  const meters = new Set();

  class LiveMeter {
    /**
     * @param {HTMLElement} card  elemento com [data-meter-value] e, opcionalmente,
     *   [data-meter-compact], [data-meter-status], [data-meter-rate], [data-meter-year].
     * @param {{ onRender?: (value: number) => void }} options
     */
    constructor(card, { onRender } = {}) {
      this.card = card;
      this.valueEl = card.querySelector('[data-meter-value]');
      this.compactEl = card.querySelector('[data-meter-compact]');
      this.statusEl = card.querySelector('[data-meter-status]');
      this.onRender = onRender;
      this.data = null;
      this.lastRendered = '';
      meters.add(this);
    }

    /**
     * A projeção usa o relógio monotônico do navegador a partir do instante da
     * resposta; o atraso entre a medição da fonte e a resposta vem do servidor.
     * Assim um relógio local errado não distorce o valor.
     */
    setData(data) {
      const sourceLagSeconds = Math.max(0, (Date.parse(data.consultadoEm) - Date.parse(data.referencia)) / 1000) || 0;
      const receivedAt = performance.now();
      this.data = {
        valor: Number(data.valor),
        incremento: data.emAndamento ? Number(data.incrementoPorSegundo) || 0 : 0,
        lag: sourceLagSeconds,
        receivedAt
      };
      // Hora de Brasília a partir do servidor, avançada pelo relógio monotônico.
      this.serverClock = { at: Date.parse(data.consultadoEm), receivedAt };
      this.lastRendered = '';
      this.lastClock = '';
      this.card.removeAttribute('aria-busy');
      this.card.querySelector('.tax-meter-error')?.remove();
      this.valueEl.hidden = false;
      this.card.querySelectorAll('[data-meter-year]').forEach(el => { el.textContent = data.periodo?.ano ?? '—'; });

      if (data.desatualizado) this.setStatus('stale', 'Último dado disponível');
      else if (data.emAndamento) this.setStatus('live', 'Ao vivo');
      else this.setStatus('closed', 'Ano encerrado');
      if (this.statusEl) this.statusEl.title = `Última consulta à fonte às ${time.format(new Date(data.consultadoEm))}`;

      this.card.querySelectorAll('[data-meter-rate]').forEach(el => {
        const seconds = { second: 1, minute: 60, hour: 3600, day: 86400 }[el.dataset.meterRate];
        const amount = this.data.incremento * seconds;
        el.textContent = this.data.incremento ? (seconds === 1 ? brl.format(amount) : compactBRL(amount)) : '—';
      });
      this.render();
    }

    current() {
      if (!this.data) return null;
      const elapsed = this.data.lag + (performance.now() - this.data.receivedAt) / 1000;
      return this.data.valor + this.data.incremento * elapsed;
    }

    setStatus(state, label) {
      if (!this.statusEl) return;
      this.statusEl.dataset.state = state;
      this.statusEl.querySelector('span').textContent = label;
    }

    setLoading() {
      this.card.setAttribute('aria-busy', 'true');
      this.setStatus('loading', 'Carregando');
    }

    setError(message, retry) {
      this.data = null;
      this.card.removeAttribute('aria-busy');
      this.setStatus('error', 'Indisponível');
      this.valueEl.hidden = true;
      if (this.compactEl) this.compactEl.textContent = '';
      this.card.querySelectorAll('[data-meter-rate]').forEach(el => { el.textContent = '—'; });
      this.card.querySelector('.tax-meter-error')?.remove();

      const error = document.createElement('p');
      error.className = 'tax-meter-error';
      error.setAttribute('role', 'status');
      error.textContent = message;
      if (retry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Tentar novamente';
        button.addEventListener('click', retry);
        error.append(button);
      }
      this.valueEl.after(error);
    }

    updateClock() {
      if (!this.statusEl || this.statusEl.dataset.state !== 'live' || !this.serverClock) return;
      const now = this.serverClock.at + (performance.now() - this.serverClock.receivedAt);
      const label = `Ao vivo · ${clock.format(new Date(now))}`;
      if (label === this.lastClock) return;
      this.lastClock = label;
      this.statusEl.querySelector('span').textContent = label;
    }

    render() {
      const value = this.current();
      if (value === null) return;
      this.updateClock();
      const [integer, cents] = brl.format(value).split(',');
      const text = `${integer},${cents}`;
      if (text === this.lastRendered) return;
      this.lastRendered = text;

      const centsEl = document.createElement('span');
      centsEl.className = 'tax-meter-cents';
      centsEl.textContent = `,${cents}`;
      this.valueEl.replaceChildren(document.createTextNode(integer), centsEl);
      if (this.compactEl) this.compactEl.textContent = `≈ ${compactBRL(value)}`;
      this.onRender?.(value);
    }
  }

  /* ---------------------------------------------------------------- relógio */

  let tickHandle = null;
  const tick = () => meters.forEach(meter => meter.render());
  const start = () => {
    if (tickHandle === null) tickHandle = window.setInterval(tick, TICK_MS);
  };
  const stop = () => {
    if (tickHandle !== null) window.clearInterval(tickHandle);
    tickHandle = null;
  };

  // Sem animação em aba oculta; ao voltar, os valores são recalculados do zero.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();

  window.KingsLiveCounter = {
    LiveMeter,
    createApiClient,
    brasiliaYear,
    format: { brl, brlInteger, compactBRL, percent, time, clock }
  };
})();
