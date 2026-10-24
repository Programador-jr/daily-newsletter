const grid = document.querySelector("#news-grid"),
  dateEl = document.querySelector("#edition-date"),
  featuredNews = document.querySelector("#featured-news"),
  historyPanel = document.getElementById('history-panel'),
  closeHistory = document.getElementById('close-history'),
  historyList = document.getElementById('history-list'),
  filterButtons = document.getElementById('filter-buttons');

let currentStories = [];
let currentFilter = 'all';
let currentSearch = '';
let currentEditionDate = null;
let searchInput = null;
let searchInputBound = false;

const asText = value => value == null ? '' : String(value);

const safeExternalUrl = value => {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
};

const isValidEditionDate = value => {
  if (typeof value !== 'string') return false;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year)
    && date.getMonth() === Number(month) - 1
    && date.getDate() === Number(day);
};

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = asText(text);
  return element;
};

const createLoadingState = (message, className = '') => {
  const wrapper = createElement('div', `data-loading ${className}`.trim());
  wrapper.setAttribute('role', 'status');
  wrapper.setAttribute('aria-live', 'polite');
  const spinner = createElement('span', 'data-loading-spinner');
  spinner.setAttribute('aria-hidden', 'true');
  wrapper.append(spinner, createElement('span', '', message));
  return wrapper;
};

const showMessage = (container, title, message) => {
  if (!container) return;
  const article = createElement('article', 'story featured');
  article.append(createElement('h2', '', title), createElement('p', '', message));
  container.replaceChildren(article);
};

const bindNavigationSearch = () => {
  searchInput = document.getElementById('search-input');
  if (!searchInput || searchInputBound) return;
  searchInputBound = true;
  searchInput.addEventListener('input', event => {
    currentSearch = event.target.value.toLowerCase();
    applyFiltersAndSearch();
  });
};
window.addEventListener('site:navigation-ready', bindNavigationSearch);

const formatDate = (value) => {
  if (!value) return "";

  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return match[1] + '/' + match[2] + '/' + match[3];
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatEditionLabel = (issueNumber, date) => {
  const formattedDate = formatDate(date);
  if (!formattedDate) return "";
  return issueNumber
    ? `Edição #${String(issueNumber).padStart(3, '0')} • ${formattedDate}`
    : formattedDate;
};

const setLoadingState = (loading) => {
  if (dateEl && loading) {
    dateEl.textContent = "CARREGANDO...";
  }

  if (featuredNews && loading) {
    featuredNews.replaceChildren(createLoadingState('Buscando as notícias...'));
  }

  if (grid && loading) {
    grid.replaceChildren(createLoadingState('Carregando notícias...', 'data-loading-grid'));
  }
};

const currentPage = window.location.pathname;
const isEditionsPage = currentPage === "/editions" || currentPage === "/editions/" || currentPage === "/editions.html";

setLoadingState(true);

fetch("/api/news")
  .then((r) => {
    if (!r.ok) throw new Error("Não foi possível carregar a edição.");
    return r.json();
  })
  .then((data) => {
    setLoadingState(false);
    const stories = Array.isArray(data?.stories) ? data.stories : [];
    currentEditionDate = asText(data?.date);

    if (isEditionsPage) {
      const editionTitle = document.querySelector('#edition-title');
      if (editionTitle) {
        editionTitle.textContent = formatEditionLabel(data?.issueNumber, data?.date) || 'Edição Atual';
      }
    }

    if (dateEl) {
      dateEl.textContent = formatEditionLabel(data?.issueNumber, data?.date);
    }

    document.title = `King's Newsletter — ${formatDate(data?.date)}`;

    if (currentPage === '/') {
      if (featuredNews && stories.length > 0) {
        const headlineStory = stories.find(story => story?.headline === true) || stories[0];
        featuredNews.replaceChildren(createStoryCard(headlineStory, true));
      } else if (featuredNews) {
        showMessage(featuredNews, 'Nenhuma notícia disponível', 'Não há notícias para exibir nesta edição.');
      }
    } else if (isEditionsPage) {
      currentStories = stories;
      setupCategoryFilters(currentStories);
      bindNavigationSearch();
      renderStories(currentStories);
    }
  })
  .catch(() => {
    setLoadingState(false);
    showMessage(grid, 'Não foi possível carregar esta edição.', 'Tente novamente mais tarde.');
    showMessage(featuredNews, 'Não foi possível carregar a notícia em destaque.', 'Tente novamente mais tarde.');
  });

if (historyPanel && closeHistory && historyList) {
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const historyToggle = target?.closest('#history-toggle');

    if (historyToggle) {
      historyPanel.classList.toggle('open');
      if (historyPanel.classList.contains('open')) {
        loadHistoryList();
      }
      return;
    }

    if (closeHistory.contains(target)) {
      historyPanel.classList.remove('open');
      return;
    }

    if (!historyPanel.contains(target)) {
      historyPanel.classList.remove('open');
    }
  });
}

async function loadHistoryList() {
  historyList.replaceChildren(createLoadingState('Carregando histórico...', 'data-loading-history'));

  try {
    const response = await fetch("/api/news?history=true");
    if (!response.ok) throw new Error("Não foi possível carregar o histórico.");

    const archives = await response.json();
    if (!Array.isArray(archives)) throw new Error("Formato de histórico inválido.");

    const archivesWithCounts = await Promise.all(
      archives.map(async (archive) => {
        const date = asText(archive?.date);
        if (!isValidEditionDate(date)) {
          return { date: '', title: 'Edição indisponível', stories: 0 };
        }

        try {
          const archiveResponse = await fetch(`/api/news?date=${encodeURIComponent(date)}`);
          if (!archiveResponse.ok) throw new Error("Arquivo não encontrado.");

          const edition = await archiveResponse.json();
          return {
            ...archive,
            date,
            stories: Array.isArray(edition.stories) ? edition.stories.length : 0
          };
        } catch {
          return {
            ...archive,
            date,
            stories: Number.isFinite(archive?.stories) ? archive.stories : 0
          };
        }
      })
    );

    const fragment = document.createDocumentFragment();
    archivesWithCounts.forEach(archive => {
      const item = createElement('div', 'history-item');
      item.tabIndex = archive.date ? 0 : -1;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-disabled', archive.date ? 'false' : 'true');
      item.append(
        createElement('div', 'history-date', (archive.issueNumber ? 'Edição #' + String(archive.issueNumber).padStart(3, '0') + ' · ' : '') + formatDate(archive.date)),
        createElement('div', 'history-meta', `${archive.stories} notícias`)
      );

      if (archive.date) {
        item.addEventListener('click', () => window.loadArchiveEdition(archive.date));
        item.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            window.loadArchiveEdition(archive.date);
          }
        });
      }
      fragment.append(item);
    });

    historyList.replaceChildren(fragment);
    if (!archivesWithCounts.length) {
      historyList.append(createElement('p', '', 'Nenhum histórico disponível.'));
    }
  } catch {
    const message = createElement('p', '', 'Nenhum histórico disponível.');
    message.style.textAlign = 'center';
    message.style.color = 'var(--text-muted)';
    message.style.padding = '1rem';
    historyList.replaceChildren(message);
  }
}

window.loadArchiveEdition = function(date) {
  if (!isValidEditionDate(String(date))) {
    showMessage(grid, 'Data inválida', 'Selecione uma edição válida do histórico.');
    return;
  }

  if (!isEditionsPage) {
    window.location.href = `/editions?date=${encodeURIComponent(date)}`;
    return;
  }

  if (grid) {
    grid.replaceChildren(createLoadingState('Carregando edição...', 'data-loading-grid'));
  }

  fetch(`/api/news?date=${encodeURIComponent(date)}`)
    .then((r) => {
      if (!r.ok) throw new Error('Edição não encontrada.');
      return r.json();
    })
    .then((data) => {
      const editionTitle = document.querySelector('#edition-title');
      if (editionTitle) {
        editionTitle.textContent = formatEditionLabel(data.issueNumber, data.date) || 'Edição';
      }

      if (dateEl) dateEl.textContent = formatDate(data.date).toUpperCase();

      currentStories = Array.isArray(data.stories) ? data.stories : [];
      currentFilter = 'all';
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      setupCategoryFilters(currentStories);
      renderStories(currentStories);

      if (historyPanel) historyPanel.classList.remove('open');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
    .catch(() => {
      showMessage(grid, 'Edição não encontrada', 'O arquivo solicitado não existe no servidor. Selecione outra data do histórico.');
    });
};

const urlParams = new URLSearchParams(window.location.search);
const dateParam = urlParams.get('date');
if (dateParam && isEditionsPage) {
  setTimeout(() => window.loadArchiveEdition(dateParam), 500);
}

function createStoryCard(story, featured = false, index = 0) {
  const article = createElement('article', `story ${featured || index === 0 ? 'featured' : ''} ${featured ? 'spotlight-card' : ''}`.trim());
  const imageUrl = safeExternalUrl(story?.image?.url);
  if (imageUrl && imageUrl.startsWith('https://')) {
    const image = createElement('img', 'story-image');
    image.src = imageUrl;
    image.alt = asText(story?.image?.alt || story?.title || 'Imagem da notícia');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'strict-origin-when-cross-origin';
    article.append(image);
  }

  if (featured) {
    article.append(createElement('h2', '', story?.title));

    const editionLink = createElement('a', 'home-edition-link');
    editionLink.href = '/editions';
    editionLink.setAttribute('aria-label', 'Abrir edição completa');
    editionLink.append(
      createElement('span', '', 'Abrir edição'),
      createElement('i', 'fas fa-arrow-up-right-from-square')
    );
    editionLink.lastElementChild.setAttribute('aria-hidden', 'true');
    article.append(editionLink);
    return article;
  }

  const meta = createElement('div', 'story-meta');
  meta.append(
    createElement('span', 'category', story?.category),
    createElement('span', 'dot'),
    createElement('span', 'source', story?.source)
  );

  const title = createElement('h2', '', story?.title);
  const summary = createElement('p', '', story?.summary);
  const context = createElement('p', 'context');
  context.append(createElement('strong', '', 'Contexto: '), document.createTextNode(asText(story?.context)));

  const footer = createElement('div', 'story-footer');
  footer.append(createElement('span', 'source', formatDate(story?.publishedAt)));

  const safeUrl = safeExternalUrl(story?.url);
  if (safeUrl) {
    const link = createElement('a', 'source-link', 'Ler fonte');
    link.href = safeUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    footer.append(link);
  } else {
    const unavailable = createElement('span', 'source-link', 'Fonte indisponível');
    unavailable.setAttribute('aria-disabled', 'true');
    footer.append(unavailable);
  }

  article.append(meta, title, summary, context, footer);
  return article;
}

function renderStories(stories) {
  if (!grid) return;

  if (!Array.isArray(stories) || stories.length === 0) {
    showMessage(grid, 'Nenhuma notícia encontrada', 'Tente ajustar os filtros ou a busca.');
    return;
  }

  const fragment = document.createDocumentFragment();
  stories.forEach((story, index) => fragment.append(createStoryCard(story, false, index)));
  grid.replaceChildren(fragment);
}

function setupCategoryFilters(stories) {
  if (!filterButtons) return;

  const categories = [...new Set(
    (Array.isArray(stories) ? stories : [])
      .map(story => asText(story?.category).trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const fragment = document.createDocumentFragment();
  const allButton = createElement('button', 'filter-btn active', 'Todas');
  allButton.type = 'button';
  allButton.dataset.filter = 'all';
  fragment.append(allButton);

  categories.forEach(category => {
    const button = createElement('button', 'filter-btn', category);
    button.type = 'button';
    button.dataset.filter = category;
    fragment.append(button);
  });

  filterButtons.replaceChildren(fragment);
  filterButtons.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.querySelectorAll(".filter-btn").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      applyFiltersAndSearch();
    });
  });
}

function applyFiltersAndSearch() {
  let filtered = currentStories;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(story => asText(story?.category) === currentFilter);
  }

  if (currentSearch) {
    filtered = filtered.filter(story =>
      asText(story?.title).toLowerCase().includes(currentSearch) ||
      asText(story?.summary).toLowerCase().includes(currentSearch) ||
      asText(story?.context).toLowerCase().includes(currentSearch)
    );
  }

  renderStories(filtered);
}
