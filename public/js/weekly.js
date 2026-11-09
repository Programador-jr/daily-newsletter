(() => {
  const $ = id => document.getElementById(id);
  const status = $('weekly-status');
  const currentSection = $('weekly-current');
  const currentSlot = $('weekly-current-slot');
  const archiveSection = $('weekly-archive');
  const archiveGroups = $('weekly-archive-groups');
  const editionRoot = $('weekly-edition');
  const hero = {
    back: $('weekly-back'),
    eyebrow: $('weekly-eyebrow'),
    title: $('weekly-title'),
    kicker: $('weekly-kicker'),
    deck: $('weekly-deck'),
    meta: $('weekly-hero-meta')
  };

  if (!status || !currentSection || !currentSlot || !archiveSection || !archiveGroups || !editionRoot) return;

  const SITE_NAME = "King's Newsletter";
  const DEFAULT_TITLE = 'A Semana em Foco';
  const SIGN_OFF = 'King’s Newsletter — Informação, contexto e análise para compreender o que acontece no Brasil e no mundo.';
  const CONTEXT_HEADING = 'Por que isso importa?';
  const ANALYSIS_ID = 'o-que-a-semana-nos-mostrou';
  const ANALYSIS_HEADING = 'O que a semana nos mostrou';
  const WORDS_PER_MINUTE = 200;
  const slug = new URLSearchParams(window.location.search).get('slug');

  /* ---------------------------------------------------------------- */
  /* Utilidades                                                        */
  /* ---------------------------------------------------------------- */

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null && text !== '') node.textContent = String(text);
    return node;
  };

  const icon = name => {
    const node = el('i', 'fas ' + name);
    node.setAttribute('aria-hidden', 'true');
    return node;
  };

  const list = value => (Array.isArray(value) ? value : []);
  const plural = (count, one, many) => count + ' ' + (count === 1 ? one : many);

  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const hostname = url => {
    try {
      return new URL(url).hostname.replace(/^www\d*\./, '');
    } catch {
      return '';
    }
  };

  const firstLine = text => String(text || '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';

  const excerpt = (text, max = 260) => {
    const clean = firstLine(text);
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
  };

  /* O texto vem como foi escrito. Cada linha é um parágrafo; linhas que
     começam com "*", "-" ou "•" formam uma lista; uma linha curta terminada
     em "?" vira subtítulo ("O que isso significa?"). */
  const isQuestion = line => line.length <= 90 && /\?$/.test(line);

  const textBlocks = (text, paragraphClass) => {
    const nodes = [];
    let bullets = null;
    String(text || '').split(/\r?\n/).map(line => line.trim()).forEach(line => {
      if (!line) {
        bullets = null;
        return;
      }
      const item = line.match(/^[*•\-–]\s+(.+)$/);
      if (item) {
        if (!bullets) {
          bullets = el('ul', 'weekly-bullets');
          nodes.push(bullets);
        }
        bullets.append(el('li', '', item[1]));
        return;
      }
      bullets = null;
      nodes.push(isQuestion(line) ? el('h4', 'weekly-question', line) : el('p', paragraphClass, line));
    });
    return nodes;
  };

  /* Datas da semana representam dias civis; UTC evita deslocar o dia. */
  const toDate = value => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const partsOf = (date, month = 'long') => new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month, year: 'numeric', timeZone: 'UTC'
  }).formatToParts(date).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

  const dayLabel = day => (day === '1' ? '1º' : day);

  const formatDate = value => {
    const date = toDate(value);
    if (!date) return '';
    const p = partsOf(date);
    return dayLabel(p.day) + ' de ' + p.month + ' de ' + p.year;
  };

  const formatPeriod = edition => {
    const start = toDate(edition.weekStart);
    const end = toDate(edition.weekEnd);
    if (!start || !end) return formatDate(edition.weekStart || edition.weekEnd);
    const a = partsOf(start);
    const b = partsOf(end);
    const da = dayLabel(a.day);
    const db = dayLabel(b.day);
    if (a.year !== b.year) return da + ' de ' + a.month + ' de ' + a.year + ' a ' + db + ' de ' + b.month + ' de ' + b.year;
    if (a.month !== b.month) return da + ' de ' + a.month + ' a ' + db + ' de ' + b.month + ' de ' + b.year;
    if (a.day !== b.day) return da + ' a ' + db + ' de ' + b.month + ' de ' + b.year;
    return db + ' de ' + b.month + ' de ' + b.year;
  };

  /* Período curto para a capa: "02—08 NOV 2026". */
  const coverPeriod = edition => {
    const start = toDate(edition.weekStart);
    const end = toDate(edition.weekEnd) || start;
    if (!end) return '';
    const fmt = date => {
      const p = partsOf(date, 'short');
      return { day: p.day.padStart(2, '0'), month: p.month.replace('.', '').toUpperCase(), year: p.year };
    };
    const b = fmt(end);
    if (!start) return b.day + ' ' + b.month + ' ' + b.year;
    const a = fmt(start);
    if (a.year !== b.year) return a.day + ' ' + a.month + ' ' + a.year + ' — ' + b.day + ' ' + b.month + ' ' + b.year;
    if (a.month !== b.month) return a.day + ' ' + a.month + ' — ' + b.day + ' ' + b.month + ' ' + b.year;
    return a.day + '—' + b.day + ' ' + b.month + ' ' + b.year;
  };

  const monthKey = edition => {
    const date = toDate(edition.weekEnd) || toDate(edition.weekStart);
    if (!date) return 'Sem data';
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const numberLabel = edition => (edition.editionNumber ? String(edition.editionNumber).padStart(3, '0') : '');

  const editionLabel = edition => (edition.editionNumber ? 'Edição nº ' + numberLabel(edition) : 'Edição semanal');

  const editionUrl = edition => '/weekly?slug=' + encodeURIComponent(edition.slug);

  const titleOf = edition => edition.title || DEFAULT_TITLE;

  const sectionsOf = edition => list(edition.sections);
  const storiesOf = edition => sectionsOf(edition).flatMap(section => list(section.stories));

  /* Contagens: a edição completa traz as seções; o arquivo traz só os totais. */
  const counts = edition => ({
    sections: Number.isFinite(edition.sectionCount) ? edition.sectionCount : sectionsOf(edition).length,
    stories: Number.isFinite(edition.storyCount) ? edition.storyCount : storiesOf(edition).length
  });

  const readingMinutes = edition => {
    const words = [edition.intro, edition.analysis]
      .concat(sectionsOf(edition).map(section => section.intro))
      .concat(storiesOf(edition).flatMap(story => [story.title, story.summary, story.context]))
      .filter(Boolean)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  };

  /* ---------------------------------------------------------------- */
  /* Estado                                                            */
  /* ---------------------------------------------------------------- */

  /* Skeleton: o HTML já traz o da capa (página inicial). Ao abrir uma edição,
     ele é trocado pelo do sumário + texto e o cabeçalho fica mascarado até a
     resposta chegar. As linhas usam .page-skeleton-line (page-skeletons.css). */
  const skeleton = $('weekly-skeleton');
  const main = $('main');
  const heroPlaceholders = [hero.eyebrow, hero.title, hero.deck].filter(Boolean);
  const skeletonLine = extra => el('span', 'page-skeleton-line' + (extra ? ' ' + extra : ''));

  const showEditionSkeleton = () => {
    if (!skeleton) return;
    heroPlaceholders.forEach(node => node.classList.add('page-skeleton-line', 'weekly-sk-hero'));

    const toc = el('div', 'weekly-skeleton-toc');
    toc.append(skeletonLine('weekly-sk-eyebrow'));
    for (let i = 0; i < 8; i += 1) toc.append(skeletonLine('weekly-sk-toc-item'));

    const text = el('div', 'weekly-skeleton-article');
    const paragraph = count => {
      for (let i = 0; i < count; i += 1) text.append(skeletonLine('weekly-sk-text' + (i === count - 1 ? ' is-short' : '')));
    };
    paragraph(5);
    for (let chapter = 0; chapter < 2; chapter += 1) {
      text.append(skeletonLine('weekly-sk-h2'));
      text.append(skeletonLine('weekly-sk-story-title'));
      paragraph(4);
      text.append(skeletonLine('weekly-sk-question'));
      paragraph(3);
    }

    skeleton.classList.add('is-edition');
    skeleton.replaceChildren(toc, text);
  };

  const finishLoading = () => {
    skeleton?.remove();
    heroPlaceholders.forEach(node => node.classList.remove('page-skeleton-line', 'weekly-sk-hero'));
    main?.removeAttribute('aria-busy');
  };

  const setStatus = (message, { isError = false, showArchiveLink = false } = {}) => {
    status.replaceChildren();
    status.hidden = false;
    status.classList.toggle('is-error', isError);
    if (isError) status.append(icon('fa-circle-exclamation'));
    status.append(el('span', '', message));
    if (showArchiveLink) {
      const link = el('a', 'weekly-status-link', 'Ver todas as edições');
      link.href = '/weekly';
      status.append(link);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Índice: capa da última edição + arquivo por mês                   */
  /* ---------------------------------------------------------------- */

  const renderCover = edition => {
    const cover = el('a', 'weekly-cover');
    cover.href = editionUrl(edition);
    cover.setAttribute('aria-hidden', 'true');
    cover.tabIndex = -1;
    cover.append(el('span', 'weekly-cover-brand', DEFAULT_TITLE));
    const number = el('span', 'weekly-cover-number');
    if (edition.editionNumber) {
      number.append(el('small', '', 'Nº'));
      number.append(document.createTextNode(numberLabel(edition)));
    } else {
      number.textContent = 'Edição';
    }
    cover.append(number);
    cover.append(el('span', 'weekly-cover-period', coverPeriod(edition)));
    return cover;
  };

  const renderIssue = edition => {
    const card = el('article', 'weekly-issue-card');
    card.append(renderCover(edition));

    const body = el('div', 'weekly-issue-body');
    const meta = el('p', 'weekly-meta');
    meta.append(el('span', 'weekly-meta-number', editionLabel(edition)));
    if (edition.subtitle) meta.append(el('span', 'weekly-meta-kicker', edition.subtitle));
    else if (formatPeriod(edition)) meta.append(el('span', '', formatPeriod(edition)));
    body.append(meta);

    const title = el('h3', 'weekly-issue-title');
    const titleLink = el('a', '', titleOf(edition));
    titleLink.href = editionUrl(edition);
    title.append(titleLink);
    body.append(title);

    const deck = excerpt(edition.intro);
    if (deck) body.append(el('p', 'weekly-issue-deck', deck));

    const sections = sectionsOf(edition).filter(section => section.title);
    if (sections.length) {
      const contents = el('div', 'weekly-issue-contents');
      contents.append(el('span', 'eyebrow', 'Nesta edição'));
      const items = el('ul');
      sections.forEach(section => {
        const item = el('li');
        item.append(el('span', '', section.title));
        const count = list(section.stories).length;
        if (count) item.append(el('small', '', String(count)));
        items.append(item);
      });
      contents.append(items);
      body.append(contents);
    }

    const footer = el('div', 'weekly-issue-footer');
    const total = counts(edition);
    footer.append(el('span', 'weekly-stats', [
      plural(total.sections, 'seção', 'seções'),
      plural(total.stories, 'notícia', 'notícias'),
      readingMinutes(edition) + ' min de leitura'
    ].join(' · ')));
    const cta = el('a', 'cta-button', 'Ler edição');
    cta.href = editionUrl(edition);
    cta.append(icon('fa-arrow-right'));
    footer.append(cta);
    body.append(footer);

    card.append(body);
    return card;
  };

  const renderArchiveRow = edition => {
    const item = el('li');
    const link = el('a', 'weekly-archive-row');
    link.href = editionUrl(edition);
    link.append(el('span', 'weekly-archive-number', edition.editionNumber ? 'Nº ' + numberLabel(edition) : '—'));
    const body = el('span', 'weekly-archive-body');
    body.append(el('strong', '', titleOf(edition)));
    body.append(el('span', '', [formatPeriod(edition), plural(counts(edition).stories, 'notícia', 'notícias')].filter(Boolean).join(' · ')));
    link.append(body);
    link.append(icon('fa-arrow-right'));
    item.append(link);
    return item;
  };

  const renderArchive = editions => {
    const groups = new Map();
    editions.forEach(edition => {
      const key = monthKey(edition);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(edition);
    });
    archiveGroups.replaceChildren(...[...groups].map(([month, items]) => {
      const group = el('section', 'weekly-archive-group');
      group.append(el('h3', 'weekly-archive-month', month));
      const rows = el('ol', 'weekly-archive-list');
      items.forEach(edition => rows.append(renderArchiveRow(edition)));
      group.append(rows);
      return group;
    }));
  };

  const renderIndex = (latest, editions) => {
    if (!latest) {
      const empty = el('div', 'empty-state weekly-empty');
      empty.append(icon('fa-newspaper'));
      empty.append(el('h3', '', 'A primeira edição está sendo preparada.'));
      empty.append(el('p', '', 'Ainda não há publicações semanais disponíveis. Assim que uma edição for publicada, ela aparecerá aqui.'));
      $('weekly-current-title').textContent = 'Em breve';
      currentSlot.replaceChildren(empty);
      currentSection.hidden = false;
      return;
    }
    currentSlot.replaceChildren(renderIssue(latest));
    currentSection.hidden = false;
    const older = editions.filter(edition => edition.slug !== latest.slug);
    if (older.length) {
      renderArchive(older);
      archiveSection.hidden = false;
    }
  };

  /* ---------------------------------------------------------------- */
  /* Edição completa                                                   */
  /* ---------------------------------------------------------------- */

  const renderHero = edition => {
    const period = formatPeriod(edition);
    hero.eyebrow.textContent = editionLabel(edition) + (period ? ' · ' + period : '');
    hero.title.textContent = titleOf(edition);
    if (edition.subtitle && hero.kicker) {
      hero.kicker.textContent = edition.subtitle;
      hero.kicker.hidden = false;
    }
    hero.deck?.remove();
    if (hero.back) hero.back.hidden = false;

    if (hero.meta) {
      const total = counts(edition);
      const items = [];
      const published = formatDate(edition.publishedAt);
      if (published) items.push(['fa-calendar-check', 'Publicada em ' + published]);
      items.push(['fa-layer-group', plural(total.sections, 'seção', 'seções')]);
      items.push(['fa-newspaper', plural(total.stories, 'notícia', 'notícias')]);
      items.push(['fa-clock', readingMinutes(edition) + ' min de leitura']);
      hero.meta.replaceChildren(...items.map(([name, text]) => {
        const li = el('li');
        li.append(icon(name), el('span', '', text));
        return li;
      }));
      hero.meta.hidden = false;
    }
  };

  const renderSource = story => {
    const url = safeUrl(story.url);
    if (!story.source && !url) return null;
    const line = el('p', 'weekly-source');
    line.append(el('span', 'weekly-source-label', 'Fontes:'));
    if (url) {
      const link = el('a', '', story.source || hostname(url));
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      line.append(link);
    } else {
      line.append(el('span', '', story.source));
    }
    return line;
  };

  const renderStory = story => {
    const block = el('section', 'weekly-story');
    block.append(el('h3', '', story.title));
    textBlocks(story.summary).forEach(node => block.append(node));
    if (story.context) {
      if (!isQuestion(firstLine(story.context))) block.append(el('h4', 'weekly-question', CONTEXT_HEADING));
      textBlocks(story.context).forEach(node => block.append(node));
    }
    const source = renderSource(story);
    if (source) block.append(source);
    return block;
  };

  /* Sumário como acordeão (<details>): aberto na coluna lateral do desktop;
     no celular fica fechado, fixo no topo, e a lista abre por cima do texto.
     A animação de abrir/fechar vem de accordion-motion.js. */
  const compactToc = window.matchMedia('(max-width: 960px)');

  const setTocOpen = (panel, open) => {
    if (panel.open === open) return;
    if (window.accordionMotion?.setOpen) window.accordionMotion.setOpen(panel, open);
    else panel.open = open;
  };

  /* Altura do cabeçalho fixo do site, para o sumário grudar logo abaixo dele. */
  const syncStickyOffset = () => {
    const header = document.querySelector('.site-header');
    const height = header ? Math.round(header.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--weekly-header-offset', height + 'px');
  };

  const renderToc = entries => {
    const toc = el('nav', 'weekly-toc');
    toc.setAttribute('aria-label', 'Sumário da edição');

    const panel = el('details', 'weekly-toc-panel');
    panel.open = !compactToc.matches;

    const summary = el('summary', 'weekly-toc-summary');
    const label = el('span', 'weekly-toc-label');
    label.append(icon('fa-list-ul'), el('span', '', 'Sumário'));
    summary.append(label);
    summary.append(el('span', 'weekly-toc-current'));
    summary.append(icon('fa-chevron-down'));
    panel.append(summary);

    const items = el('ol');
    entries.forEach(([id, text]) => {
      const li = el('li');
      const link = el('a', '', text);
      link.href = '#' + id;
      link.addEventListener('click', () => {
        if (compactToc.matches) setTocOpen(panel, false);
      });
      li.append(link);
      items.append(li);
    });
    panel.append(items);
    toc.append(panel);

    compactToc.addEventListener('change', event => setTocOpen(panel, !event.matches));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && compactToc.matches && panel.open) {
        setTocOpen(panel, false);
        summary.focus();
      }
    });
    syncStickyOffset();
    window.addEventListener('resize', syncStickyOffset, { passive: true });
    return toc;
  };

  /* Destaca no sumário a seção que está sendo lida e mostra o nome dela na
     barra do acordeão (útil no celular, onde a lista fica fechada). */
  const trackActiveSection = toc => {
    if (!('IntersectionObserver' in window)) return;
    const current = toc.querySelector('.weekly-toc-current');
    const links = new Map([...toc.querySelectorAll('a')].map(link => [link.getAttribute('href').slice(1), link]));
    const targets = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)));
      const reading = targets.find(target => visible.has(target.id));
      if (!reading) return;
      links.forEach((link, id) => {
        const active = id === reading.id;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'true');
          if (current) current.textContent = link.textContent;
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach(target => observer.observe(target));
  };

  const renderPager = (edition, editions) => {
    const pager = el('nav', 'weekly-pager');
    pager.setAttribute('aria-label', 'Navegação entre edições');
    const index = editions.findIndex(item => item.slug === edition.slug);
    const newer = index > 0 ? editions[index - 1] : null;
    const older = index >= 0 && index < editions.length - 1 ? editions[index + 1] : null;

    const card = (target, direction) => {
      if (!target) return el('span', 'weekly-pager-spacer');
      const link = el('a', 'weekly-pager-link is-' + direction);
      link.href = editionUrl(target);
      link.append(el('span', 'weekly-pager-label', direction === 'prev' ? 'Edição anterior' : 'Próxima edição'));
      link.append(el('strong', '', titleOf(target)));
      link.append(el('span', 'weekly-pager-meta', [editionLabel(target), formatPeriod(target)].filter(Boolean).join(' · ')));
      return link;
    };

    pager.append(card(older, 'prev'));
    const all = el('a', 'weekly-pager-all', 'Todas as edições');
    all.href = '/weekly';
    all.prepend(icon('fa-table-list'));
    pager.append(all);
    pager.append(card(newer, 'next'));
    return pager;
  };

  const renderEdition = (edition, editions) => {
    const sections = sectionsOf(edition);
    renderHero(edition);

    const content = el('div', 'weekly-article');

    if (edition.intro) {
      const intro = el('div', 'weekly-intro');
      textBlocks(edition.intro).forEach(node => intro.append(node));
      content.append(intro);
    }

    sections.forEach((section, index) => {
      const chapter = el('section', 'weekly-chapter');
      chapter.id = 'secao-' + (index + 1);
      chapter.append(el('h2', '', section.title));
      textBlocks(section.intro, 'weekly-chapter-intro').forEach(node => chapter.append(node));
      list(section.stories).forEach(story => chapter.append(renderStory(story)));
      content.append(chapter);
    });

    if (edition.analysis) {
      const analysis = el('section', 'weekly-chapter weekly-analysis');
      analysis.id = ANALYSIS_ID;
      analysis.append(el('h2', '', ANALYSIS_HEADING));
      textBlocks(edition.analysis).forEach(node => analysis.append(node));
      content.append(analysis);
    }

    content.append(el('p', 'weekly-signoff', SIGN_OFF));

    const entries = sections.map((section, index) => ['secao-' + (index + 1), section.title]);
    if (edition.analysis) entries.push([ANALYSIS_ID, ANALYSIS_HEADING]);
    const toc = entries.length ? renderToc(entries) : null;

    editionRoot.replaceChildren(...[toc, content].filter(Boolean));
    if (!toc) editionRoot.classList.add('is-single');
    editionRoot.append(renderPager(edition, editions));
    editionRoot.hidden = false;
    if (toc) trackActiveSection(toc);

    const title = titleOf(edition);
    document.title = /king['’]s newsletter/i.test(title) ? title : title + ' | ' + SITE_NAME;
    const description = document.querySelector('meta[name="description"]');
    const summary = excerpt(edition.intro, 157);
    if (description && summary) description.setAttribute('content', summary);

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  };

  /* ---------------------------------------------------------------- */
  /* Carregamento                                                      */
  /* ---------------------------------------------------------------- */

  const load = async () => {
    try {
      const endpoint = '/api/weekly-editions' + (slug ? '?slug=' + encodeURIComponent(slug) : '');
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      const payload = await response.json().catch(() => ({}));

      finishLoading();

      if (response.status === 404) {
        setStatus(payload.error || 'Esta edição não está disponível.', { isError: true, showArchiveLink: true });
        return;
      }
      if (!response.ok) throw new Error(payload.error);

      status.hidden = true;
      const editions = list(payload.editions);
      if (slug) renderEdition(payload.edition, editions);
      else renderIndex(payload.edition, editions);
    } catch (error) {
      finishLoading();
      setStatus(error.message || 'Não foi possível carregar as publicações. Tente novamente mais tarde.', { isError: true });
    }
  };

  if (slug) showEditionSkeleton();
  void load();
})();
