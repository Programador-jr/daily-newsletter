const grid = document.querySelector("#news-grid"),
  dateEl = document.querySelector("#edition-date"),
  featuredNews = document.querySelector("#featured-news"),
  historyToggle = document.getElementById('history-toggle'),
  historyPanel = document.getElementById('history-panel'),
  closeHistory = document.getElementById('close-history'),
  historyList = document.getElementById('history-list'),
  searchInput = document.getElementById('search-input'),
  filterButtons = document.getElementById('filter-buttons'),
  switchInput = document.getElementById('theme-switch'),
  themeLabel = document.getElementById('theme-label');

let currentStories = [];
let currentFilter = 'all';
let currentSearch = '';

const formatDate = (value) => {
  if (!value) return "";

  // Datas YYYY-MM-DD representam uma data do calendário, não um instante UTC.
  // Criar a data localmente evita que fusos como America/Rio_Branco voltem um dia.
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

// Detect current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Theme toggle
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

if (savedTheme === "dark") {
  switchInput.checked = true;
  themeLabel.textContent = "";
} else {
  switchInput.checked = false;
  themeLabel.textContent = "";
}

switchInput.addEventListener('change', (e) => {
  if(e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeLabel.textContent = '';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeLabel.textContent = '';
    localStorage.setItem('theme', 'light');
  }
});

// Load news data
fetch("data/news.json")
  .then((r) => {
    if (!r.ok) throw new Error("Não foi possível carregar a edição.");
    return r.json();
  })
  .then((data) => {
    // Update date if on home or editions page
    if (dateEl) {
      dateEl.textContent = formatDate(data.date).toUpperCase();
    }
    
    // Update page title
    document.title = `King's Newsletter — ${formatDate(data.date)}`;
    
    // Load content based on page
    if (currentPage === 'index.html' || currentPage === '') {
      // Home page - show featured news only
      if (featuredNews && data.stories.length > 0) {
        const featured = data.stories[0];
        featuredNews.innerHTML = `
          <div class="story-meta">
            <span class="category">${featured.category}</span>
            <span class="dot"></span>
            <span class="source">${featured.source}</span>
          </div>
          <h2>${featured.title}</h2>
          <p>${featured.summary}</p>
          <p class="context"><strong>Contexto:</strong> ${featured.context}</p>
          <div class="story-footer">
            <span class="source">${featured.publishedAt || ""}</span>
            <a class="source-link" href="${featured.url}" target="_blank" rel="noopener noreferrer">Ler fonte</a>
          </div>
        `;
      }
    } else if (currentPage === 'editions.html') {
      // Editions page - show full grid with filters
      currentStories = data.stories;
      setupCategoryFilters(currentStories);
      
      // Setup search
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.toLowerCase();
          applyFiltersAndSearch();
        });
      }
      
      // Initial render
      renderStories(currentStories);
    }
  })
  .catch((error) => {
    if (grid) {
      grid.innerHTML = `<article class="story featured"><h2>Não foi possível carregar esta edição.</h2><p>${error.message}</p></article>`;
    }
    if (featuredNews) {
      featuredNews.innerHTML = `<p>Não foi possível carregar a notícia em destaque.</p>`;
    }
  });

// History panel functionality
if (historyToggle && historyPanel && closeHistory && historyList) {
  historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('open');
    if (historyPanel.classList.contains('open')) {
      loadHistoryList();
    }
  });

  closeHistory.addEventListener('click', () => {
    historyPanel.classList.remove('open');
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (historyPanel && historyToggle && !historyPanel.contains(e.target) && !historyToggle.contains(e.target)) {
      historyPanel.classList.remove('open');
    }
  });
}

function loadHistoryList() {
  fetch("data/archive/list.json")
    .then((r) => {
      if (!r.ok) throw new Error("Não foi possível carregar o histórico.");
      return r.json();
    })
    .then((archives) => {
      historyList.innerHTML = archives
        .map((archive) => `
          <div class="history-item" onclick="loadArchiveEdition('${archive.date}')">
            <div class="history-date">${formatDate(archive.date).toUpperCase()}</div>
            <div class="history-title">${archive.title || `Edição ${archive.date}`}</div>
            <div class="history-meta">${archive.stories} notícias</div>
          </div>
        `)
        .join("");
    })
    .catch((error) => {
      historyList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">Nenhum histórico disponível.</p>`;
    });
}

// Function to load archived edition
window.loadArchiveEdition = function(date) {
  // If not on editions page, redirect to editions page first
  if (currentPage !== 'editions.html') {
    window.location.href = `editions.html?date=${date}`;
    return;
  }

  fetch(`data/archive/${date}.json`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Arquivo da edição ${date} não encontrado.`);
      }
      return r.json();
    })
    .then((data) => {
      if (dateEl) {
        dateEl.textContent = formatDate(data.date).toUpperCase();
      }
      
      // Update current stories and stats
      currentStories = data.stories;
      
      
      currentFilter = 'all';
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      setupCategoryFilters(currentStories);
      
      // Render stories
      renderStories(currentStories);
      
      // Close history panel
      if (historyPanel) {
        historyPanel.classList.remove('open');
      }
      
      // Scroll to news grid
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

// Check if there's a date parameter in URL (for redirected users)
const urlParams = new URLSearchParams(window.location.search);
const dateParam = urlParams.get('date');
if (dateParam && currentPage === 'editions.html') {
  setTimeout(() => {
    window.loadArchiveEdition(dateParam);
  }, 500);
}

// Helper functions for editions page
function renderStories(stories) {
  if (!grid) return;
  
  if (stories.length === 0) {
    grid.innerHTML = `<article class="story featured"><h2>Nenhuma notícia encontrada</h2><p>Tente ajustar os filtros ou a busca.</p></article>`;
    return;
  }
  
  grid.innerHTML = stories
    .map((s, i) =>
      `<article class="story ${i === 0 ? "featured" : ""}"><div class="story-meta"><span class="category">${s.category}</span><span class="dot"></span><span class="source">${s.source}</span></div><h2>${s.title}</h2><p>${s.summary}</p><p class="context"><strong>Contexto:</strong> ${s.context}</p><div class="story-footer"><span class="source">${s.publishedAt || ""}</span><a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">Ler fonte</a></div></article>`,
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
  
  // Apply category filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(story => story.category === currentFilter);
  }
  
  // Apply search filter
  if (currentSearch) {
    filtered = filtered.filter(story => 
      story.title.toLowerCase().includes(currentSearch) ||
      story.summary.toLowerCase().includes(currentSearch) ||
      story.context.toLowerCase().includes(currentSearch)
    );
  }
  
  renderStories(filtered);
}
