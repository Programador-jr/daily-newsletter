const grid = document.querySelector("#news-grid"),
  dateEl = document.querySelector("#edition-date"),
  featuredNews = document.querySelector("#featured-news"),
  historyPanel = document.getElementById('history-panel'),
  closeHistory = document.getElementById('close-history'),
  historyList = document.getElementById('history-list'),
  searchInput = document.getElementById('search-input'),
  filterButtons = document.getElementById('filter-buttons'),
  themeToggle = document.getElementById('theme-toggle'),
  themeIcon = document.getElementById('theme-icon');

let currentStories = [];
let isLoadingEdition = true;
let currentFilter = 'all';
let currentSearch = '';
let currentEditionDate = null;

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

const checkPendingEmailNotifications = async () => {
  try {
    await fetch('/api/notify-news', {
      method: 'GET',
      cache: 'no-store'
    });
  } catch (error) {
    console.error('Não foi possível verificar notificações pendentes:', error);
  }
};

const setLoadingState = (loading) => {
  isLoadingEdition = loading;

  if (dateEl && loading) {
    dateEl.textContent = "CARREGANDO...";
  }

  if (featuredNews && loading) {
    featuredNews.innerHTML = `
      <div class="data-loading" role="status" aria-live="polite">
        <span class="data-loading-spinner" aria-hidden="true"></span>
        <span>Buscando as notícias...</span>
      </div>
    `;
  }

  if (grid && loading) {
    grid.innerHTML = `
      <div class="data-loading data-loading-grid" role="status" aria-live="polite">
        <span class="data-loading-spinner" aria-hidden="true"></span>
        <span>Carregando notícias...</span>
      </div>
    `;
  }
};

const currentPage = window.location.pathname;
const isEditionsPage = currentPage === "/editions" || currentPage === "/editions/" || currentPage === "/editions.html";

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

const updateThemeControl = (theme) => {
  if (!themeToggle || !themeIcon) return;
  const isDark = theme === "dark";
  themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  themeToggle.setAttribute("aria-pressed", String(isDark));
};

updateThemeControl(savedTheme);

themeToggle?.addEventListener("click", () => {
  const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeControl(theme);
});

setLoadingState(true);

fetch("/api/news")
  .then((r) => {
    if (!r.ok) throw new Error("Não foi possível carregar a edição.");
    return r.json();
  })
  .then((data) => {
    setLoadingState(false);
    currentEditionDate = data.date;

    if (dateEl) {
      dateEl.textContent = formatDate(data.date).toUpperCase();
    }

    document.title = `King's Newsletter — ${formatDate(data.date)}`;

    if (currentPage === '/') {
      if (featuredNews && data.stories.length > 0) {
        const featured = data.stories[0];
        featuredNews.innerHTML = `
          <article class="story featured spotlight-card">
          <div class="story-meta">
            <span class="category">${featured.category}</span>
            <span class="dot"></span>
            <span class="source">${featured.source}</span>
          </div>
          <h2>${featured.title}</h2>
          <p>${featured.summary}</p>
          <p class="context"><strong>Contexto:</strong> ${featured.context}</p>
          <div class="story-footer">
            <span class="source">${formatDate(featured.publishedAt)}</span>
            <a class="source-link" href="${featured.url}" target="_blank" rel="noopener noreferrer">Ler fonte</a>
          </div>
          </article>
        `;
      }
    } else if (isEditionsPage) {
      currentStories = data.stories;
      setupCategoryFilters(currentStories);

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.toLowerCase();
          applyFiltersAndSearch();
        });
      }

      renderStories(currentStories);
    }

    checkPendingEmailNotifications();
  })
  .catch((error) => {
    setLoadingState(false);
    if (grid) {
      grid.innerHTML = `<article class="story featured"><h2>Não foi possível carregar esta edição.</h2><p>${error.message}</p></article>`;
    }
    if (featuredNews) {
      featuredNews.innerHTML = `<p>Não foi possível carregar a notícia em destaque.</p>`;
    }
  });

if (historyPanel && closeHistory && historyList) {
  document.addEventListener('click', (e) => {
    const historyToggle = e.target.closest('#history-toggle');

    if (historyToggle) {
      historyPanel.classList.toggle('open');
      if (historyPanel.classList.contains('open')) {
        loadHistoryList();
      }
      return;
    }

    if (closeHistory.contains(e.target)) {
      historyPanel.classList.remove('open');
      return;
    }

    if (!historyPanel.contains(e.target)) {
      historyPanel.classList.remove('open');
    }
  });
}

async function loadHistoryList() {
  historyList.innerHTML = `
    <div class="data-loading data-loading-history" role="status" aria-live="polite">
      <span class="data-loading-spinner" aria-hidden="true"></span>
      <span>Carregando histórico...</span>
    </div>
  `;

  try {
    const response = await fetch("/api/news?history=true");
    if (!response.ok) throw new Error("Não foi possível carregar o histórico.");

    const archives = await response.json();

    const archivesWithCounts = await Promise.all(
      archives.map(async (archive) => {
        try {
          const archiveResponse = await fetch(`/api/news?date=${archive.date}`);
          if (!archiveResponse.ok) throw new Error("Arquivo não encontrado.");

          const edition = await archiveResponse.json();
          return {
            ...archive,
            stories: Array.isArray(edition.stories) ? edition.stories.length : 0
          };
        } catch {
          return {
            ...archive,
            stories: Number.isFinite(archive.stories) ? archive.stories : 0
          };
        }
      })
    );

    historyList.innerHTML = archivesWithCounts
      .map((archive) => `
        <div class="history-item" onclick="loadArchiveEdition('${archive.date}')">
          <div class="history-date">${formatDate(archive.date).toUpperCase()}</div>
          <div class="history-title">${archive.title || `Edição ${archive.date}`}</div>
          <div class="history-meta">${archive.stories} notícias</div>
        </div>
      `)
      .join("");
  } catch (error) {
    historyList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">Nenhum histórico disponível.</p>`;
  }
}

window.loadArchiveEdition = function(date) {
  if (!isEditionsPage) {
    window.location.href = `/editions?date=${date}`;
    return;
  }

  if (grid) {
    grid.innerHTML = `
      <div class="data-loading data-loading-grid" role="status" aria-live="polite">
        <span class="data-loading-spinner" aria-hidden="true"></span>
        <span>Carregando edição...</span>
      </div>
    `;
  }

  fetch(`/api/news?date=${date}`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Edição ${date} não encontrada.`);
      }
      return r.json();
    })
    .then((data) => {
      const editionTitle = document.querySelector('#edition-title');
      if (editionTitle) {
        editionTitle.textContent = data.date === currentEditionDate
          ? 'Edição Atual'
          : `Edição ${formatDate(data.date)}`;
      }

      if (dateEl) {
        dateEl.textContent = formatDate(data.date).toUpperCase();
      }

      currentStories = data.stories;
      currentFilter = 'all';
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      setupCategoryFilters(currentStories);
      renderStories(currentStories);

      if (historyPanel) {
        historyPanel.classList.remove('open');
      }

      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    })
    .catch((error) => {
      if (grid) {
        grid.innerHTML = `<article class="story featured"><h2>Edição não encontrada</h2><p>O arquivo da edição ${formatDate(date)} não existe no servidor. Selecione outra data do histórico.</p></article>`;
      }
    });
};

const urlParams = new URLSearchParams(window.location.search);
const dateParam = urlParams.get('date');
if (dateParam && isEditionsPage) {
  setTimeout(() => {
    window.loadArchiveEdition(dateParam);
  }, 500);
}

function renderStories(stories) {
  if (!grid) return;

  if (stories.length === 0) {
    grid.innerHTML = `<article class="story featured"><h2>Nenhuma notícia encontrada</h2><p>Tente ajustar os filtros ou a busca.</p></article>`;
    return;
  }

  grid.innerHTML = stories
    .map((s, i) =>
      `<article class="story ${i === 0 ? "featured" : ""}"><div class="story-meta"><span class="category">${s.category}</span><span class="dot"></span><span class="source">${s.source}</span></div><h2>${s.title}</h2><p>${s.summary}</p><p class="context"><strong>Contexto:</strong> ${s.context}</p><div class="story-footer"><span class="source">${formatDate(s.publishedAt)}</span><a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">Ler fonte</a></div></article>`,
    )
    .join("");
}

function setupCategoryFilters(stories) {
  if (!filterButtons) return;
  const categories = [...new Set(stories.map(story => story.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  filterButtons.innerHTML = [
    '<button class="filter-btn active" data-filter="all">Todas</button>',
    ...categories.map(category => '<button class="filter-btn" data-filter="' + category + '">' + category + '</button>')
  ].join("");
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
    filtered = filtered.filter(story => story.category === currentFilter);
  }

  if (currentSearch) {
    filtered = filtered.filter(story =>
      story.title.toLowerCase().includes(currentSearch) ||
      story.summary.toLowerCase().includes(currentSearch) ||
      story.context.toLowerCase().includes(currentSearch)
    );
  }

  renderStories(filtered);
}
