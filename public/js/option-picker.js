/**
 * Painel de opções acessível sobre um <select> nativo.
 *
 * O <select> continua sendo a fonte do valor: o painel lê suas opções, escreve
 * `select.value` e dispara `change`. Qualquer código que preencha ou desabilite
 * o select é refletido automaticamente (MutationObserver).
 *
 * Marcação esperada:
 *   <label><span class="picker-label">Estado</span>
 *     <span class="picker-select">…ícone…<select data-search-placeholder="Buscar estado"></select>…seta…</span>
 *   </label>
 *
 * Atributos opcionais nas <option>: data-meta (texto auxiliar à direita).
 */
(() => {
  'use strict';

  const SEARCH_THRESHOLD = 8;
  let uid = 0;
  const openPickers = new Set();

  const normalize = text => String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

  const element = (tag, className, attributes = {}) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  };

  class OptionPicker {
    constructor(select) {
      this.select = select;
      this.wrapper = select.closest('.picker-select');
      this.id = `option-picker-${++uid}`;
      this.items = [];
      this.visible = [];
      this.activeIndex = -1;
      this.isOpen = false;
      this.build();
      this.refresh();

      new MutationObserver(() => this.refresh()).observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled']
      });
      select.addEventListener('change', () => this.refresh());
    }

    build() {
      const label = this.select.closest('label');
      const labelText = label?.querySelector('.picker-label');
      if (labelText && !labelText.id) labelText.id = `${this.id}-label`;

      this.trigger = element('button', 'picker-trigger', {
        type: 'button',
        'aria-haspopup': 'listbox',
        'aria-expanded': 'false',
        'aria-controls': `${this.id}-panel`
      });
      this.valueEl = element('span', 'picker-value', { id: `${this.id}-value` });
      this.trigger.append(this.valueEl);
      if (labelText) this.trigger.setAttribute('aria-labelledby', `${labelText.id} ${this.valueEl.id}`);

      this.panel = element('div', 'picker-panel', { id: `${this.id}-panel` });
      this.panel.hidden = true;

      this.searchBox = element('div', 'picker-search');
      this.searchInput = element('input', '', {
        type: 'search',
        autocomplete: 'off',
        spellcheck: 'false',
        placeholder: this.select.dataset.searchPlaceholder || 'Buscar',
        'aria-label': this.select.dataset.searchPlaceholder || 'Buscar opção',
        'aria-controls': `${this.id}-list`,
        'aria-autocomplete': 'list',
        role: 'combobox',
        'aria-expanded': 'true'
      });
      const searchIcon = element('i', 'fas fa-magnifying-glass', { 'aria-hidden': 'true' });
      this.searchBox.append(searchIcon, this.searchInput);

      this.list = element('ul', 'picker-list', { id: `${this.id}-list`, role: 'listbox', tabindex: '-1' });
      if (labelText) this.list.setAttribute('aria-labelledby', labelText.id);
      this.empty = element('p', 'picker-empty');
      this.empty.textContent = 'Nenhum resultado.';
      this.empty.hidden = true;
      this.status = element('p', 'picker-status', { role: 'status', 'aria-live': 'polite' });

      this.panel.append(this.searchBox, this.list, this.empty, this.status);
      // O botão vem antes do select para que o <label> o tenha como alvo.
      this.select.before(this.trigger);
      this.wrapper.append(this.panel);
      this.wrapper.classList.add('is-enhanced');
      this.select.tabIndex = -1;
      this.select.setAttribute('aria-hidden', 'true');

      this.trigger.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
      this.trigger.addEventListener('keydown', event => this.onTriggerKey(event));
      this.searchInput.addEventListener('input', () => this.filter(this.searchInput.value));
      this.searchInput.addEventListener('keydown', event => this.onListKey(event));
      this.list.addEventListener('keydown', event => this.onListKey(event));
      // O painel fica dentro do <label>: sem isto, todo clique nele "ativaria"
      // o label e reabriria o painel pelo botão.
      this.panel.addEventListener('click', event => {
        if (event.target !== this.searchInput) event.preventDefault();
      });
      this.list.addEventListener('click', event => {
        const option = event.target.closest('[role="option"]');
        if (option) this.choose(Number(option.dataset.index));
      });
      this.list.addEventListener('pointermove', event => {
        const option = event.target.closest('[role="option"]');
        if (option) this.setActive(this.visible.indexOf(Number(option.dataset.index)), { scroll: false });
      });
    }

    refresh() {
      this.items = Array.from(this.select.options).map((option, index) => ({
        index,
        value: option.value,
        text: option.textContent.trim(),
        meta: option.dataset.meta || '',
        search: normalize(`${option.textContent} ${option.dataset.meta || ''} ${option.value}`)
      }));

      const selected = this.items[this.select.selectedIndex];
      const disabled = this.select.disabled || !this.items.length;
      this.trigger.disabled = disabled;
      this.wrapper.classList.toggle('is-disabled', disabled);
      this.valueEl.replaceChildren(document.createTextNode(selected?.text || '—'));
      if (selected?.meta) {
        const meta = element('small', 'picker-value-meta');
        meta.textContent = selected.meta;
        this.valueEl.append(meta);
      }

      if (disabled && this.isOpen) this.close({ focus: false });
      else if (this.isOpen) this.filter(this.searchInput.value, { keepActive: true });
    }

    open() {
      if (this.trigger.disabled || this.isOpen) return;
      openPickers.forEach(picker => picker.close({ focus: false }));
      this.isOpen = true;
      openPickers.add(this);

      const searchable = this.items.length > SEARCH_THRESHOLD;
      this.searchBox.hidden = !searchable;
      this.searchInput.value = '';
      this.filter('');
      this.panel.hidden = false;
      this.wrapper.classList.add('is-open');
      this.trigger.setAttribute('aria-expanded', 'true');
      this.position({ reveal: true });

      const selectedPosition = this.visible.indexOf(this.select.selectedIndex);
      this.setActive(selectedPosition >= 0 ? selectedPosition : 0, { block: 'center' });
      (searchable ? this.searchInput : this.list).focus({ preventScroll: true });
    }

    close({ focus = true } = {}) {
      if (!this.isOpen) return;
      this.isOpen = false;
      openPickers.delete(this);
      this.panel.hidden = true;
      this.wrapper.classList.remove('is-open', 'opens-up', 'aligns-right');
      this.trigger.setAttribute('aria-expanded', 'false');
      if (focus) this.trigger.focus({ preventScroll: true });
    }

    /**
     * Abre para baixo e rola a página o necessário para mostrar o painel inteiro.
     * Só abre para cima quando a página já não tem como rolar (fim do documento).
     */
    position({ reveal = false } = {}) {
      this.wrapper.classList.remove('opens-up', 'aligns-right');
      const panel = this.panel.getBoundingClientRect();
      if (panel.right > document.documentElement.clientWidth - 8) this.wrapper.classList.add('aligns-right');
      if (!reveal) return;

      const overflow = panel.bottom + 12 - window.innerHeight;
      if (overflow <= 0) return;
      const room = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (room >= overflow) {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollBy({ top: overflow, behavior: smooth ? 'smooth' : 'auto' });
      } else if (this.trigger.getBoundingClientRect().top > panel.height + 100) {
        this.wrapper.classList.add('opens-up');
      }
    }

    filter(query, { keepActive = false } = {}) {
      const activeItem = keepActive ? this.visible[this.activeIndex] : undefined;
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      this.visible = this.items
        .filter(item => terms.every(term => item.search.includes(term)))
        .map(item => item.index);

      const selectedIndex = this.select.selectedIndex;
      this.list.replaceChildren(...this.visible.map(index => {
        const item = this.items[index];
        const option = element('li', 'picker-option', {
          id: `${this.id}-option-${index}`,
          role: 'option',
          'aria-selected': String(index === selectedIndex)
        });
        option.dataset.index = String(index);
        const text = element('span', 'picker-option-text');
        text.textContent = item.text;
        option.append(text);
        if (item.meta) {
          const meta = element('span', 'picker-option-meta');
          meta.textContent = item.meta;
          option.append(meta);
        }
        option.append(element('i', 'fas fa-check picker-check', { 'aria-hidden': 'true' }));
        return option;
      }));

      this.empty.hidden = this.visible.length > 0;
      if (terms.length) {
        const count = this.visible.length;
        this.status.textContent = count ? `${count} ${count === 1 ? 'resultado' : 'resultados'}` : 'Nenhum resultado';
      } else {
        this.status.textContent = '';
      }

      const keptPosition = activeItem === undefined ? -1 : this.visible.indexOf(activeItem);
      this.setActive(keptPosition >= 0 ? keptPosition : 0);
    }

    setActive(position, { scroll = true, block = 'nearest' } = {}) {
      this.list.querySelector('.is-active')?.classList.remove('is-active');
      if (!this.visible.length || position < 0) {
        this.activeIndex = -1;
        this.searchInput.removeAttribute('aria-activedescendant');
        this.list.removeAttribute('aria-activedescendant');
        return;
      }
      this.activeIndex = Math.min(Math.max(position, 0), this.visible.length - 1);
      const option = this.list.children[this.activeIndex];
      option.classList.add('is-active');
      this.searchInput.setAttribute('aria-activedescendant', option.id);
      this.list.setAttribute('aria-activedescendant', option.id);
      if (scroll) this.scrollToOption(option, block);
    }

    /** Rola só a lista (scrollIntoView também rolaria a página). */
    scrollToOption(option, block) {
      const list = this.list;
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (block === 'center') list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2;
      else if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }

    choose(index) {
      const item = this.items[index];
      if (!item) return;
      this.close();
      if (this.select.value === item.value) return;
      this.select.value = item.value;
      this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    onTriggerKey(event) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.open();
      }
    }

    onListKey(event) {
      const last = this.visible.length - 1;
      const pageSize = 8;
      const keys = {
        ArrowDown: () => this.setActive(this.activeIndex + 1),
        ArrowUp: () => this.setActive(this.activeIndex - 1),
        PageDown: () => this.setActive(this.activeIndex + pageSize),
        PageUp: () => this.setActive(this.activeIndex - pageSize),
        Enter: () => this.activeIndex >= 0 && this.choose(this.visible[this.activeIndex]),
        Escape: () => this.close()
      };
      // Home/End movem o cursor do texto quando a busca está visível.
      if (event.target === this.list) {
        keys.Home = () => this.setActive(0);
        keys.End = () => this.setActive(last);
        keys[' '] = keys.Enter;
      }

      if (event.key === 'Tab') return this.close({ focus: false });
      if (keys[event.key]) {
        event.preventDefault();
        keys[event.key]();
        return;
      }

      // Sem busca visível: digitar pula para a primeira opção com aquela inicial.
      if (event.target === this.list && event.key.length === 1 && /\S/.test(event.key)) {
        const letter = normalize(event.key);
        const start = this.activeIndex + 1;
        const order = [...this.visible.slice(start), ...this.visible.slice(0, start)];
        const match = order.find(index => normalize(this.items[index].text).startsWith(letter));
        if (match !== undefined) this.setActive(this.visible.indexOf(match));
      }
    }
  }

  document.addEventListener('pointerdown', event => {
    openPickers.forEach(picker => {
      if (!picker.wrapper.contains(event.target)) picker.close({ focus: false });
    });
  });

  window.addEventListener('resize', () => openPickers.forEach(picker => picker.position()), { passive: true });

  window.KingsOptionPicker = {
    enhance(root = document) {
      return Array.from(root.querySelectorAll('.picker-select > select'))
        .filter(select => !select.closest('.is-enhanced'))
        .map(select => new OptionPicker(select));
    }
  };
})();
