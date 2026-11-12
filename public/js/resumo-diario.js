/* O Dia em Perspectiva — resumo diário enviado aos assinantes.
   Usa a mesma estrutura visual de A Semana em Foco (weekly.css): capa do
   resumo mais recente, arquivo por mês e leitura completa com sumário. */
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
  const BRAND = 'O Dia em Perspectiva';
  const PAGE_PATH = '/resumo-diario';
  const SIGN_OFF = 'King’s Newsletter — Informação, contexto e análise para compreender o que acontece no Brasil e no mundo.';
  const CONTEXT_HEADING = 'Por que isso importa?';
  const WATCH_ID = 'o-que-acompanhar';
  const WATCH_HEADING = 'O que acompanhar';
  const WORDS_PER_MINUTE = 200;
  const requestedDate = new URLSearchParams(window.location.search).get('data');

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

  /* Cada linha é um parágrafo; "*", "-" ou "•" formam lista; uma linha curta
     terminada em "?" vira subtítulo ("Por que isso importa?"). */
  const isQuestion = line => line.length <= 90 && /\?$/.test(line);

  const textBlocks = text => {
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
      nodes.push(isQuestion(line) ? el('h4', 'weekly-question', line) : el('p', '', line));
    });
    return nodes;
  };

  /* A data do resumo é um dia civil (AAAA-MM-DD); UTC evita deslocar o dia. */
  const toDate = key => {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const date = new Date(key + 'T00:00:00Z');
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const partsOf = (date, month = 'long') => new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month, year: 'numeric', timeZone: 'UTC'
  }).formatToParts(date).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

  const dayLabel = day => (day === '1' ? '1º' : day);

  const formatDay = key => {
    const date = toDate(key);
    if (!date) return '';
    const p = partsOf(date);
    return dayLabel(p.day) + ' de ' + p.month + ' de ' + p.year;
  };

  const weekdayOf = key => {
    const date = toDate(key);
    if (!date) return '';
    const name = partsOf(date).weekday;
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const coverDay = key => {
    const date = toDate(key);
    if (!date) return { day: '', label: '' };
    const p = partsOf(date, 'short');
    return { day: p.day.padStart(2, '0'), label: p.month.replace('.', '').toUpperCase() + ' ' + p.year };
  };

  const monthKey = digest => {
    const date = toDate(digest.date);
    if (!date) return 'Sem data';
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const numberLabel = digest => (digest.issueNumber ? String(digest.issueNumber).padStart(3, '0') : '');
  const editionLabel = digest => (digest.issueNumber ? 'Edição nº ' + numberLabel(digest) : 'Resumo diário');
  const digestUrl = digest => PAGE_PATH + '?data=' + encodeURIComponent(digest.date);
  const titleOf = digest => digest.title || BRAND;

  const storiesOf = digest => list(digest.stories);
  const storyCount = digest => (Number.isFinite(digest.storyCount) ? digest.storyCount : storiesOf(digest).length);

  const readingMinutes = digest => {
    const words = [digest.preheader]
      .concat(storiesOf(digest).flatMap(story => [story.title, story.summary, story.context]))
      .concat(list(digest.watchNext))
      .filter(Boolean)
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  };

  /* Notícias consecutivas do mesmo tema formam um capítulo (a ordem editorial manda). */
  const chaptersOf = digest => storiesOf(digest).reduce((chapters, story) => {
    const title = story.category || 'Outras notícias';
    const last = chapters[chapters.length - 1];
    if (last && last.title === title) last.stories.push(story);
    else chapters.push({ title, stories: [story] });
    return chapters;
  }, []);

  /* ---------------------------------------------------------------- */
  /* Estado                                                            */
  /* ---------------------------------------------------------------- */

  const skeleton = $('weekly-skeleton');
  const main = $('main');
  const heroPlaceholders = [hero.eyebrow, hero.title, hero.deck].filter(Boolean);
  const skeletonLine = extra => el('span', 'page-skeleton-line' + (extra ? ' ' + extra : ''));

  const showDigestSkeleton = () => {
    if (!skeleton) return;
    heroPlaceholders.forEach(node => node.classList.add('page-skeleton-line', 'weekly-sk-hero'));
    const toc = el('div', 'weekly-skeleton-toc');
    toc.append(skeletonLine('weekly-sk-eyebrow'));
    for (let i = 0; i < 6; i += 1) toc.append(skeletonLine('weekly-sk-toc-item'));
    const text = el('div', 'weekly-skeleton-article');
    for (let chapter = 0; chapter < 2; chapter += 1) {
      text.append(skeletonLine('weekly-sk-h2'));
      text.append(skeletonLine('weekly-sk-story-title'));
      for (let i = 0; i < 4; i += 1) text.append(skeletonLine('weekly-sk-text' + (i === 3 ? ' is-short' : '')));
      text.append(skeletonLine('weekly-sk-question'));
      for (let i = 0; i < 3; i += 1) text.append(skeletonLine('weekly-sk-text' + (i === 2 ? ' is-short' : '')));
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
      const link = el('a', 'weekly-status-link', 'Ver todos os resumos');
      link.href = PAGE_PATH;
      status.append(link);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Índice: capa do resumo mais recente + arquivo por mês             */
  /* ---------------------------------------------------------------- */

  const renderCover = digest => {
    const cover = el('a', 'weekly-cover daily-cover');
    cover.href = digestUrl(digest);
    cover.setAttribute('aria-hidden', 'true');
    cover.tabIndex = -1;
    cover.append(el('span', 'weekly-cover-brand', BRAND));
    const day = coverDay(digest.date);
    const number = el('span', 'weekly-cover-number', day.day || '—');
    cover.append(number);
    cover.append(el('span', 'weekly-cover-period', [weekdayOf(digest.date), day.label].filter(Boolean).join(' · ')));
    return cover;
  };

  const renderIssue = digest => {
    const card = el('article', 'weekly-issue-card');
    card.append(renderCover(digest));

    const body = el('div', 'weekly-issue-body');
    const meta = el('p', 'weekly-meta');
    meta.append(el('span', 'weekly-meta-number', editionLabel(digest)));
    meta.append(el('span', '', formatDay(digest.date)));
    body.append(meta);

    const title = el('h3', 'weekly-issue-title');
    const titleLink = el('a', '', titleOf(digest));
    titleLink.href = digestUrl(digest);
    title.append(titleLink);
    body.append(title);

    if (digest.preheader) body.append(el('p', 'weekly-issue-deck', digest.preheader));

    const stories = storiesOf(digest).slice(0, 8);
    if (stories.length) {
      const contents = el('div', 'weekly-issue-contents');
      contents.append(el('span', 'eyebrow', 'Neste resumo'));
      const items = el('ul');
      stories.forEach(story => {
        const item = el('li');
        item.append(el('span', '', story.title));
        items.append(item);
      });
      contents.append(items);
      body.append(contents);
    }

    const footer = el('div', 'weekly-issue-footer');
    footer.append(el('span', 'weekly-stats', [
      plural(storyCount(digest), 'notícia', 'notícias'),
      readingMinutes(digest) + ' min de leitura'
    ].join(' · ')));
    const cta = el('a', 'cta-button', 'Ler resumo');
    cta.href = digestUrl(digest);
    cta.append(icon('fa-arrow-right'));
    footer.append(cta);
    body.append(footer);

    card.append(body);
    return card;
  };

  const renderArchiveRow = digest => {
    const item = el('li');
    const link = el('a', 'weekly-archive-row');
    link.href = digestUrl(digest);
    link.append(el('span', 'weekly-archive-number', coverDay(digest.date).day || '—'));
    const body = el('span', 'weekly-archive-body');
    body.append(el('strong', '', titleOf(digest)));
    body.append(el('span', '', [
      weekdayOf(digest.date) + ', ' + formatDay(digest.date),
      digest.issueNumber ? 'Nº ' + numberLabel(digest) : '',
      plural(storyCount(digest), 'notícia', 'notícias')
    ].filter(Boolean).join(' · ')));
    link.append(body);
    link.append(icon('fa-arrow-right'));
    item.append(link);
    return item;
  };

  const renderArchive = digests => {
    const groups = new Map();
    digests.forEach(digest => {
      const key = monthKey(digest);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(digest);
    });
    archiveGroups.replaceChildren(...[...groups].map(([month, items]) => {
      const group = el('section', 'weekly-archive-group');
      group.append(el('h3', 'weekly-archive-month', month));
      const rows = el('ol', 'weekly-archive-list');
      items.forEach(digest => rows.append(renderArchiveRow(digest)));
      group.append(rows);
      return group;
    }));
  };

  const renderIndex = (latest, digests) => {
    if (!latest) {
      const empty = el('div', 'empty-state weekly-empty');
      empty.append(icon('fa-newspaper'));
      empty.append(el('h3', '', 'O primeiro resumo está sendo preparado.'));
      empty.append(el('p', '', 'Ainda não há resumos diários publicados. Assim que um resumo for enviado aos assinantes, ele aparecerá aqui.'));
      $('weekly-current-title').textContent = 'Em breve';
      currentSlot.replaceChildren(empty);
      currentSection.hidden = false;
      return;
    }
    currentSlot.replaceChildren(renderIssue(latest));
    currentSection.hidden = false;
    const older = digests.filter(digest => digest.date !== latest.date);
    if (older.length) {
      renderArchive(older);
      archiveSection.hidden = false;
    }
  };

  /* ---------------------------------------------------------------- */
  /* Resumo completo                                                   */
  /* ---------------------------------------------------------------- */

  const renderHero = digest => {
    hero.eyebrow.textContent = [editionLabel(digest), weekdayOf(digest.date) + ', ' + formatDay(digest.date)].join(' · ');
    hero.title.textContent = titleOf(digest);
    if (digest.preheader && hero.kicker) {
      hero.kicker.textContent = digest.preheader;
      hero.kicker.hidden = false;
    }
    hero.deck?.remove();
    if (hero.back) hero.back.hidden = false;

    if (hero.meta) {
      const items = [['fa-newspaper', plural(storiesOf(digest).length, 'notícia', 'notícias')]];
      const topics = new Set(storiesOf(digest).map(story => story.category).filter(Boolean)).size;
      if (topics) items.push(['fa-layer-group', plural(topics, 'tema', 'temas')]);
      items.push(['fa-clock', readingMinutes(digest) + ' min de leitura']);
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
    line.append(el('span', '', story.source || hostname(url)));
    if (url) {
      line.append(document.createTextNode(' '));
      const link = el('a', '', 'Ler a reportagem original');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      line.append(link);
    }
    return line;
  };

  const renderFigure = image => {
    const src = safeUrl(image?.url);
    if (!src) return null;
    const figure = el('figure', 'daily-figure');
    const img = el('img');
    img.src = src;
    img.alt = image.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => figure.remove(), { once: true });
    figure.append(img);
    if (image.caption || image.credit) {
      const caption = el('figcaption');
      if (image.caption) caption.append(el('span', '', image.caption));
      if (image.credit) caption.append(el('small', 'daily-figure-credit', image.credit));
      figure.append(caption);
    }
    return figure;
  };

  const renderStory = (story, rank) => {
    const block = el('section', 'weekly-story');
    const heading = el('h3');
    heading.append(el('span', 'daily-rank', String(rank).padStart(2, '0')), document.createTextNode(story.title));
    block.append(heading);
    const figure = renderFigure(story.image);
    if (figure) block.append(figure);
    textBlocks(story.summary).forEach(node => block.append(node));
    if (story.context) {
      if (!isQuestion(firstLine(story.context))) block.append(el('h4', 'weekly-question', CONTEXT_HEADING));
      textBlocks(story.context).forEach(node => block.append(node));
    }
    const source = renderSource(story);
    if (source) block.append(source);
    return block;
  };

  /* Sumário em acordeão: aberto na lateral do desktop, fechado e fixo no
     topo no celular. A animação vem de accordion-motion.js. */
  const compactToc = window.matchMedia('(max-width: 960px)');

  const setTocOpen = (panel, open) => {
    if (panel.open === open) return;
    if (window.accordionMotion?.setOpen) window.accordionMotion.setOpen(panel, open);
    else panel.open = open;
  };

  const syncStickyOffset = () => {
    const header = document.querySelector('.site-header');
    const height = header ? Math.round(header.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--weekly-header-offset', height + 'px');
  };

  const renderToc = entries => {
    const toc = el('nav', 'weekly-toc');
    toc.setAttribute('aria-label', 'Sumário do resumo');

    const panel = el('details', 'weekly-toc-panel');
    panel.open = !compactToc.matches;

    const summary = el('summary', 'weekly-toc-summary');
    const label = el('span', 'weekly-toc-label');
    label.append(icon('fa-list-ul'), el('span', '', 'Sumário'));
    summary.append(label, el('span', 'weekly-toc-current'), icon('fa-chevron-down'));
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

  const renderPager = (digest, digests) => {
    const pager = el('nav', 'weekly-pager');
    pager.setAttribute('aria-label', 'Navegação entre resumos');
    const index = digests.findIndex(item => item.date === digest.date);
    const newer = index > 0 ? digests[index - 1] : null;
    const older = index >= 0 && index < digests.length - 1 ? digests[index + 1] : null;

    const card = (target, direction) => {
      if (!target) return el('span', 'weekly-pager-spacer');
      const link = el('a', 'weekly-pager-link is-' + direction);
      link.href = digestUrl(target);
      link.append(el('span', 'weekly-pager-label', direction === 'prev' ? 'Dia anterior' : 'Dia seguinte'));
      link.append(el('strong', '', titleOf(target)));
      link.append(el('span', 'weekly-pager-meta', formatDay(target.date)));
      return link;
    };

    pager.append(card(older, 'prev'));
    const all = el('a', 'weekly-pager-all', 'Todos os resumos');
    all.href = PAGE_PATH;
    all.prepend(icon('fa-table-list'));
    pager.append(all);
    pager.append(card(newer, 'next'));
    return pager;
  };

  const renderDigest = (digest, digests) => {
    renderHero(digest);
    const content = el('div', 'weekly-article');
    const chapters = chaptersOf(digest);
    let rank = 0;

    chapters.forEach((chapter, index) => {
      const block = el('section', 'weekly-chapter');
      block.id = 'tema-' + (index + 1);
      block.append(el('h2', '', chapter.title));
      chapter.stories.forEach(story => {
        rank += 1;
        block.append(renderStory(story, rank));
      });
      content.append(block);
    });

    const watch = list(digest.watchNext);
    if (watch.length) {
      const section = el('section', 'weekly-chapter weekly-analysis');
      section.id = WATCH_ID;
      section.append(el('h2', '', WATCH_HEADING));
      const items = el('ul', 'weekly-bullets');
      watch.forEach(item => items.append(el('li', '', item)));
      section.append(items);
      content.append(section);
    }

    content.append(el('p', 'weekly-signoff', SIGN_OFF));

    const entries = chapters.map((chapter, index) => ['tema-' + (index + 1), chapter.title]);
    if (watch.length) entries.push([WATCH_ID, WATCH_HEADING]);
    const toc = entries.length > 1 ? renderToc(entries) : null;

    editionRoot.replaceChildren(...[toc, content].filter(Boolean));
    if (!toc) editionRoot.classList.add('is-single');
    editionRoot.append(renderPager(digest, digests));
    editionRoot.hidden = false;
    if (toc) trackActiveSection(toc);

    document.title = titleOf(digest) + ' | ' + BRAND + ' | ' + SITE_NAME;
    const description = document.querySelector('meta[name="description"]');
    const summary = excerpt(digest.preheader || storiesOf(digest)[0]?.summary, 157);
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
      const endpoint = '/api/daily-digests' + (requestedDate ? '?date=' + encodeURIComponent(requestedDate) : '');
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      const payload = await response.json().catch(() => ({}));

      finishLoading();

      if (response.status === 404 || response.status === 400) {
        setStatus(payload.error || 'Este resumo não está disponível.', { isError: true, showArchiveLink: true });
        return;
      }
      if (!response.ok) throw new Error(payload.error);

      status.hidden = true;
      const digests = list(payload.digests);
      if (requestedDate && payload.digest) renderDigest(payload.digest, digests);
      else renderIndex(payload.digest, digests);
    } catch (error) {
      finishLoading();
      setStatus(error.message || 'Não foi possível carregar os resumos. Tente novamente mais tarde.', { isError: true });
    }
  };

  if (requestedDate) showDigestSkeleton();
  void load();
})();
