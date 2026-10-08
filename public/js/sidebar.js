const sitePages = [
  { href: "/", label: "Jornal Diário", icon: "fa-newspaper", group: "King's Newsletter" },
  { href: "/editions", label: "Edições", icon: "fa-clock-rotate-left", group: "King's Newsletter" },
  { href: "/historia", label: "História", icon: "fa-landmark", group: "História" },
  { href: "/presidentes", label: "Presidentes", icon: "fa-user-tie", group: "História" },
  { href: "/politica", label: "Visão geral", icon: "fa-compass", group: "Política" },
  { href: "/ideologias", label: "Ideologias", icon: "fa-scale-balanced", group: "Política" },
  { href: "/fascismo-nazismo", label: "Fascismo e Nazismo", icon: "fa-book-skull", group: "Política" },
  { href: "/politicas-publicas", label: "Políticas Públicas", icon: "fa-list-check", group: "Política" },
  { href: "/tres-poderes", label: "Três Poderes", icon: "fa-building-columns", group: "Política" },
  { href: "/cargos-publicos", label: "Cargos Públicos", icon: "fa-id-card", group: "Política" },
  { href: "/como-funciona-estado", label: "Como funciona o Estado", icon: "fa-sitemap", group: "Política" },
  { href: "/arrecadacao", label: "Arrecadação", icon: "fa-coins", group: "Dados públicos" },
  { href: "/impostos-gastos", label: "Impostômetro e Gastômetro", icon: "fa-chart-line", group: "Dados públicos" },
  { href: "/gastos-publicos", label: "Gastos públicos", icon: "fa-chart-pie", group: "Dados públicos" },
  { href: "/gastos-parlamentares", label: "Gastos parlamentares", icon: "fa-receipt", group: "Dados públicos" },
  { href: "/como-fiscalizar", label: "Como fiscalizar", icon: "fa-magnifying-glass", group: "Dados públicos" },
  { href: "/about", label: "Sobre", icon: "fa-circle-info", group: "King's Newsletter" }
];

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const setTheme = theme => {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  const isDark = normalizedTheme === "dark";

  document.documentElement.setAttribute("data-theme", normalizedTheme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
    themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
  if (themeIcon) themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
};

setTheme(localStorage.getItem("theme"));
themeToggle?.addEventListener("click", event => {
  event.stopImmediatePropagation();
  const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  setTheme(theme);
});
window.addEventListener("storage", event => {
  if (event.key === "theme") setTheme(event.newValue);
});

const initializeBackToTop = () => {
  let button = document.getElementById("back-to-top");
  if (!button) {
    button = document.createElement("button");
    button.id = "back-to-top";
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.setAttribute("title", "Voltar ao topo");
    button.setAttribute("aria-hidden", "true");
    button.tabIndex = -1;
    button.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
  }
  if (button.parentElement !== document.body) document.body.append(button);

  const updateVisibility = () => {
    const visible = window.scrollY > 500;
    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-hidden", String(!visible));
    button.tabIndex = visible ? 0 : -1;
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  });
  updateVisibility();
};

const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
const canonicalPath = currentPath === "/index.html"
  ? "/"
  : currentPath.replace(/\.html$/, "");

const createPageLink = ({ href, label, icon }) => {
  const link = document.createElement("a");
  link.href = href;
  link.dataset.sidebarLink = href === "/" ? "home" : href.slice(1);

  const iconElement = document.createElement("i");
  iconElement.className = `fas ${icon}`;
  iconElement.setAttribute("aria-hidden", "true");

  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  link.append(iconElement, labelElement);

  const isCurrentPage = href === canonicalPath;
  link.classList.toggle("active", isCurrentPage);
  if (isCurrentPage) link.setAttribute("aria-current", "page");
  return link;
};

const ensurePageLinks = (container, linkClass) => {
  sitePages.forEach(page => {
    let link = Array.from(container.querySelectorAll("a"))
      .find(existingLink => existingLink.getAttribute("href") === page.href);

    if (!link) {
      link = createPageLink(page);
      container.append(link);
    } else {
      link.classList.toggle("active", page.href === canonicalPath);
      if (page.href === canonicalPath) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    if (linkClass) link.classList.add(linkClass);
  });
};

const renderSidebarGroups = sidebarNav => {
  if (!sidebarNav) return;
  const groups = new Map();
  sitePages.forEach(page => {
    if (!groups.has(page.group)) groups.set(page.group, []);
    groups.get(page.group).push(page);
  });
  sidebarNav.replaceChildren();
  groups.forEach((pages, label) => {
    const group = document.createElement("div");
    group.className = "site-sidebar-group";
    const heading = document.createElement("span");
    heading.className = "site-sidebar-label";
    heading.textContent = label;
    group.append(heading);
    pages.forEach(page => group.append(createPageLink(page)));
    sidebarNav.append(group);
  });
};
const initializeNavigation = () => {
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("site-sidebar-backdrop");
  const openButton = document.getElementById("sidebar-toggle");
  const closeButton = document.getElementById("site-sidebar-close");
  const sidebarNav = sidebar?.querySelector(".site-sidebar-nav");
  const header = document.querySelector(".site-header");
  const sidebarPreferences = sidebar?.querySelector(".site-sidebar-preferences");
  const preferencesLabel = sidebarPreferences?.querySelector(".site-sidebar-label");
  let headerLinks = header?.querySelector(".header-primary-links");
  const headerNav = header?.querySelector(".header-main-nav");

  if (!sidebar || !backdrop || !openButton || !sidebarNav || !headerNav) return;

  if (canonicalPath !== "/editions") initializeBackToTop();

  if (!headerLinks) {
    headerLinks = document.createElement("div");
    headerLinks.className = "header-primary-links";
    headerNav.prepend(headerLinks);
  }
  headerLinks.setAttribute("aria-label", "Páginas principais");
  ensurePageLinks(headerLinks);
  renderSidebarGroups(sidebarNav);

  const headerActions = header?.querySelector(".header-nav-actions");
  const topPreferences = document.createElement("div");
  topPreferences.className = "sidebar-top-preferences";
  if (preferencesLabel) topPreferences.append(preferencesLabel);
  if (themeToggle) {
    Array.from(themeToggle.children)
      .find(child => child.textContent.trim().toLowerCase() === "tema")
      ?.remove();
    topPreferences.append(themeToggle);
  }
  sidebar.insertBefore(topPreferences, sidebarNav);
  sidebarPreferences?.remove();

  const desktopSidebar = window.matchMedia("(min-width: 1100px)");
  let desktopSidebarOpen = true;
  const syncThemeToggleLocation = () => {
    if (!themeToggle || !headerActions) return;
    if (desktopSidebar.matches) {
      themeToggle.classList.add("header-theme-toggle");
      headerActions.append(themeToggle);
    } else {
      themeToggle.classList.remove("header-theme-toggle");
      topPreferences.append(themeToggle);
    }
  };
  const syncSidebarLayout = () => {
    const isDesktop = desktopSidebar.matches;
    const isOpen = isDesktop && desktopSidebarOpen;
    sidebar.classList.toggle("is-open", isOpen);
    backdrop.classList.remove("is-open");
    sidebar.setAttribute("aria-hidden", String(!isOpen));
    backdrop.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", String(isOpen));
    openButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("sidebar-collapsed", isDesktop && !isOpen);
    document.body.classList.remove("sidebar-open");
  };

  const setOpen = open => {
    const isDesktop = desktopSidebar.matches;
    const isOpen = isDesktop || Boolean(open);
    if (isDesktop) desktopSidebarOpen = true;
    sidebar.classList.toggle("is-open", isOpen);
    backdrop.classList.toggle("is-open", isOpen && !isDesktop);
    sidebar.setAttribute("aria-hidden", String(!isOpen));
    backdrop.setAttribute("aria-hidden", String(!isOpen || isDesktop));
    openButton.setAttribute("aria-expanded", String(isOpen));
    openButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("sidebar-collapsed", isDesktop && !isOpen);
    document.body.classList.toggle("sidebar-open", isOpen && !isDesktop);
    if (isOpen) closeButton?.focus();
    else openButton.focus();
  };

  syncThemeToggleLocation();
  desktopSidebar.addEventListener("change", syncThemeToggleLocation);
  syncSidebarLayout();
  desktopSidebar.addEventListener("change", syncSidebarLayout);
  openButton.addEventListener("click", () => {
    setOpen(desktopSidebar.matches ? !sidebar.classList.contains("is-open") : true);
  });
  closeButton?.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !desktopSidebar.matches && sidebar.classList.contains("is-open")) {
      setOpen(false);
    }
  });
  sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setOpen(false)));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation, { once: true });
} else {
  initializeNavigation();
}
