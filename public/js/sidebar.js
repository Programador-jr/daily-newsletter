const sitePages = [
  { href: "/", label: "Jornal Diário", icon: "fa-newspaper" },
  { href: "/editions", label: "Edições", icon: "fa-clock-rotate-left" },
  { href: "/historia", label: "História", icon: "fa-landmark" },
  { href: "/presidentes", label: "Presidentes", icon: "fa-user-tie" },
  { href: "/ideologias", label: "Ideologias", icon: "fa-scale-balanced" },
  { href: "/politicas-publicas", label: "Políticas Públicas", icon: "fa-list-check" },
  { href: "/tres-poderes", label: "Três Poderes", icon: "fa-building-columns" },
  { href: "/cargos-publicos", label: "Cargos Públicos", icon: "fa-id-card" },
  { href: "/arrecadacao", label: "Dinheiro Público", icon: "fa-coins" },
  { href: "/gastos-parlamentares", label: "Gastos Parlamentares", icon: "fa-receipt" },
  { href: "/como-funciona-estado", label: "Como funciona o Estado", icon: "fa-sitemap" },
  { href: "/como-fiscalizar", label: "Como fiscalizar o poder público", icon: "fa-magnifying-glass" },
  { href: "/about", label: "Sobre", icon: "fa-circle-info" }
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

const initializeNavigation = () => {
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("site-sidebar-backdrop");
  const openButton = document.getElementById("sidebar-toggle");
  const closeButton = document.getElementById("site-sidebar-close");
  const sidebarGroup = sidebar?.querySelector(".site-sidebar-group");
  const header = document.querySelector(".site-header");
  let headerLinks = header?.querySelector(".header-primary-links");
  const headerNav = header?.querySelector(".header-main-nav");

  if (!sidebar || !backdrop || !openButton || !sidebarGroup || !headerNav) return;

  if (canonicalPath !== "/editions") initializeBackToTop();

  if (!headerLinks) {
    headerLinks = document.createElement("div");
    headerLinks.className = "header-primary-links";
    headerNav.prepend(headerLinks);
  }
  headerLinks.setAttribute("aria-label", "Páginas principais");
  ensurePageLinks(headerLinks);
  ensurePageLinks(sidebarGroup);

  header?.querySelectorAll("#header-theme-toggle, .header-switch-theme-toggle")
    .forEach(control => control.remove());

  const desktopSidebar = window.matchMedia("(min-width: 1100px)");
  const syncSidebarLayout = () => {
    const isPersistent = desktopSidebar.matches;
    sidebar.classList.toggle("is-open", isPersistent);
    backdrop.classList.remove("is-open");
    sidebar.setAttribute("aria-hidden", String(!isPersistent));
    backdrop.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sidebar-open");
  };

  const setOpen = open => {
    const isPersistent = desktopSidebar.matches;
    const isOpen = isPersistent || open;
    sidebar.classList.toggle("is-open", isOpen);
    backdrop.classList.toggle("is-open", open && !isPersistent);
    sidebar.setAttribute("aria-hidden", String(!isOpen));
    backdrop.setAttribute("aria-hidden", String(!open || isPersistent));
    openButton.setAttribute("aria-expanded", String(open && !isPersistent));
    document.body.classList.toggle("sidebar-open", open && !isPersistent);
    if (!isPersistent) {
      if (open) closeButton?.focus();
      else openButton.focus();
    }
  };

  syncSidebarLayout();
  desktopSidebar.addEventListener("change", syncSidebarLayout);
  openButton.addEventListener("click", () => setOpen(true));
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
