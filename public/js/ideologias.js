document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const headerThemeToggle = document.getElementById("header-theme-toggle");
  const headerThemeIcon = document.getElementById("header-theme-icon");
  const savedTheme = localStorage.getItem("theme") || "light";

  document.documentElement.setAttribute("data-theme", savedTheme);

  const updateThemeControl = (theme) => {
    const isDark = theme === "dark";

    [[themeToggle, themeIcon], [headerThemeToggle, headerThemeIcon]].forEach(([button, icon]) => {
      if (!button || !icon) return;

      icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
      button.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
      button.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
      button.setAttribute("aria-pressed", String(isDark));
    });
  };

  const toggleTheme = () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateThemeControl(theme);
  };

  themeToggle?.addEventListener("click", toggleTheme);
  headerThemeToggle?.addEventListener("click", toggleTheme);

  updateThemeControl(savedTheme);

  const top = document.getElementById("back-to-top");

  if (top) {
    const updateBackToTop = () => {
      const visible = window.scrollY > 420;

      top.classList.toggle("is-visible", visible);
      top.setAttribute("aria-hidden", String(!visible));
      top.tabIndex = visible ? 0 : -1;
    };

    window.addEventListener("scroll", updateBackToTop, { passive: true });
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    updateBackToTop();
  }

  document.querySelectorAll(".ideology-accordion").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".ideology-accordion[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});