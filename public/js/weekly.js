(() => {
  const status = document.getElementById('weekly-status');
  const list = document.getElementById('weekly-list');
  const article = document.getElementById('weekly-article');
  const sectionTitle = document.getElementById('weekly-section-title');
  const sectionOverline = document.getElementById('weekly-overline');
  const sectionDescription = document.getElementById('weekly-section-description');

  if (!status || !list || !article) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const setStatus = (message, isError = false) => {
    status.replaceChildren();
    status.hidden = false;
    const text = document.createElement('span');
    text.textContent = message;
    status.append(text);
    status.classList.toggle('is-error', isError);
  };

  const hideStatus = () => {
    status.hidden = true;
    status.classList.remove('is-error');
  };

  const formatDate = value => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  };

  const formatPeriod = edition => {
    const start = formatDate(edition.weekStart);
    const end = formatDate(edition.weekEnd);
    if (start && end) return start === end ? start : start + ' — ' + end;
    return start || end || '';
  };

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  };

  const safeExternalUrl = value => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const renderEmpty = () => {
    const empty = createElement('div', 'weekly-empty-state');
    const icon = createElement('i');
    icon.className = 'fas fa-newspaper';
    icon.setAttribute('aria-hidden', 'true');
    empty.append(icon);
    empty.append(createElement('h3', '', 'A primeira edição está sendo preparada.'));
    empty.append(createElement('p', '', 'Ainda não há publicações semanais disponíveis. Assim que uma edição for publicada, ela aparecerá aqui.'));
    list.replaceChildren(empty);
  };

  const renderCard = edition => {
    const card = createElement('article', 'weekly-edition-card');
    const meta = createElement('div', 'weekly-card-meta');
    const number = edition.editionNumber
      ? 'EDIÇÃO Nº ' + String(edition.editionNumber).padStart(3, '0')
      : 'EDIÇÃO SEMANAL';
    meta.append(createElement('span', 'weekly-card-number', number));
    const period = formatPeriod(edition);
    if (period) meta.append(createElement('span', 'weekly-card-period', period));
    card.append(meta);

    card.append(createElement('h3', '', edition.title || 'A Semana em Foco'));
    if (edition.subtitle) card.append(createElement('p', '', edition.subtitle));
    else if (edition.intro) card.append(createElement('p', '', edition.intro));

    const footer = createElement('div', 'weekly-card-footer');
    const sectionCount = Array.isArray(edition.sections) ? edition.sections.length : 0;
    footer.append(createElement('span', 'weekly-topic-count', sectionCount + (sectionCount === 1 ? ' seção editorial' : ' seções editoriais')));
    const link = createElement('a', 'weekly-read-link', 'Ler edição');
    link.href = '/weekly?slug=' + encodeURIComponent(edition.slug);
    const arrow = createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
    footer.append(link);
    card.append(footer);
    return card;
  };

  const renderStory = story => {
    const card = createElement('article', 'weekly-story');
    card.append(createElement('h4', '', story.title || 'Notícia'));
    if (story.summary) card.append(createElement('p', '', story.summary));
    if (story.context) card.append(createElement('p', '', story.context));
    const url = safeExternalUrl(story.url);
    if (url) {
      const source = createElement('a', 'weekly-story-source', story.source || 'Consultar fonte');
      source.href = url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      const icon = createElement('i');
      icon.className = 'fas fa-arrow-up-right-from-square';
      icon.setAttribute('aria-hidden', 'true');
      source.append(icon);
      card.append(source);
    }
    return card;
  };

  const renderEdition = edition => {
    list.hidden = true;
    article.hidden = false;
    article.replaceChildren();

    const header = createElement('header', 'weekly-article-header');
    const back = createElement('a', 'weekly-back-link', 'Todas as edições');
    back.href = '/weekly';
    const backIcon = createElement('i');
    backIcon.className = 'fas fa-arrow-left';
    backIcon.setAttribute('aria-hidden', 'true');
    back.prepend(backIcon);
    header.append(back);
    header.append(createElement('p', 'eyebrow', (edition.editionNumber ? 'Edição nº ' + String(edition.editionNumber).padStart(3, '0') + ' · ' : '') + formatPeriod(edition)));
    header.append(createElement('h2', '', edition.title || 'A Semana em Foco'));
    if (edition.subtitle) header.append(createElement('p', 'weekly-article-intro', edition.subtitle));
    if (edition.intro) header.append(createElement('p', 'weekly-article-intro', edition.intro));
    article.append(header);

    (Array.isArray(edition.sections) ? edition.sections : []).forEach(section => {
      const sectionElement = createElement('section', 'weekly-article-section');
      sectionElement.append(createElement('h3', '', section.title || 'Destaques'));
      if (section.intro) sectionElement.append(createElement('p', 'weekly-article-intro', section.intro));
      const stories = createElement('div', 'weekly-story-list');
      (Array.isArray(section.stories) ? section.stories : []).forEach(story => stories.append(renderStory(story)));
      sectionElement.append(stories);
      article.append(sectionElement);
    });

    if (edition.analysis) {
      const analysis = createElement('section', 'weekly-analysis');
      analysis.append(createElement('h3', '', 'Em perspectiva'));
      analysis.append(createElement('p', '', edition.analysis));
      article.append(analysis);
    }

    document.title = (edition.title || 'A Semana em Foco') + ' | King's Newsletter';
    if (sectionTitle) sectionTitle.textContent = 'Edição completa';
    if (sectionOverline) sectionOverline.textContent = 'Publicação semanal';
    if (sectionDescription) sectionDescription.textContent = formatPeriod(edition);
  };

  const load = async () => {
    setStatus('Carregando publicações...');
    try {
      const endpoint = slug
        ? '/api/weekly-editions?slug=' + encodeURIComponent(slug)
        : '/api/weekly-editions';
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Não foi possível carregar as publicações.');
      }

      hideStatus();
      if (slug) {
        if (!payload.edition) throw new Error('Esta edição não está disponível.');
        renderEdition(payload.edition);
        return;
      }

      const editions = Array.isArray(payload.editions) ? payload.editions : [];
      if (!editions.length) {
        renderEmpty();
        return;
      }
      list.replaceChildren(...editions.map(renderCard));
    } catch (error) {
      setStatus(error.message || 'Não foi possível carregar as publicações. Tente novamente mais tarde.', true);
    }
  };

  void load();
})();
