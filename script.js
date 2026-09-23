const grid = document.querySelector("#news-grid"),
  dateEl = document.querySelector("#edition-date"),
  themeToggle = document.querySelector("#theme-toggle");

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

// Theme toggle
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

fetch("data/news.json")
  .then((r) => {
    if (!r.ok) throw new Error("Não foi possível carregar a edição.");
    return r.json();
  })
  .then((data) => {
    dateEl.textContent = formatDate(data.date).toUpperCase();
    document.title = `King's Newsletter — ${formatDate(data.date)}`;
    grid.innerHTML = data.stories
      .map(
        (s, i) =>
          `<article class="story ${i === 0 ? "featured" : ""}"><div class="story-meta"><span class="category">${s.category}</span><span class="dot"></span><span class="source">${s.source}</span></div><h2>${s.title}</h2><p>${s.summary}</p><p class="context"><strong>Contexto:</strong> ${s.context}</p><div class="story-footer"><span class="source">${s.publishedAt || ""}</span><a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">Ler fonte</a></div></article>`,
      )
      .join("");
  })
  .catch((error) => {
    grid.innerHTML = `<article class="story featured"><h2>Não foi possível carregar esta edição.</h2><p>${error.message}</p></article>`;
  });
