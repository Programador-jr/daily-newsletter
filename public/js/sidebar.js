let themeToggle = null;
let themeIcon = null;
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

const initializeUpdateNotice = async () => {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin.html') return;
  try {
    const response = await fetch('/api/updates/active', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) return;
    const { update } = await response.json();
    if (!update?.activationId || !Number.isInteger(update.maxDisplays) || update.maxDisplays < 1) return;

    const browserKey = 'kings-newsletter:notice-browser-id';
    let browserId = localStorage.getItem(browserKey);
    if (!browserId) {
      browserId = globalThis.crypto?.randomUUID?.();
      if (!browserId && globalThis.crypto?.getRandomValues) {
        const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
        browserId = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      }
      if (!browserId) return;
      localStorage.setItem(browserKey, browserId);
    }

    const countKey = `kings-newsletter:notice:${browserId}:${update.activationId}`;
    const displayed = Number(localStorage.getItem(countKey) || 0);
    if (!Number.isSafeInteger(displayed) || displayed >= update.maxDisplays) return;

    const overlay = document.createElement('div');
    overlay.className = 'site-update-overlay';
    overlay.setAttribute('role', 'presentation');
    const dialog = document.createElement('section');
    dialog.className = 'site-update-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'site-update-title');
    dialog.setAttribute('aria-describedby', 'site-update-copy');
    const close = document.createElement('button');
    close.className = 'site-update-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar aviso');
    close.textContent = '×';
    const brand = document.createElement('div');
    brand.className = 'site-update-brand';
    const mark = document.createElement('span');
    mark.className = 'site-update-mark';
    mark.setAttribute('aria-hidden', 'true');
    const crown = document.createElement('i');
    crown.className = 'fas fa-crown';
    mark.append(crown);
    const brandCopy = document.createElement('span');
    brandCopy.className = 'site-update-brand-copy';
    const brandName = document.createElement('strong');
    brandName.textContent = "KING'S NEWSLETTER";
    const releaseLabel = document.createElement('small');
    releaseLabel.textContent = 'NOTA DE RELEASE';
    brandCopy.append(brandName, releaseLabel);
    brand.append(mark, brandCopy);
    const eyebrow = document.createElement('span');
    eyebrow.className = 'site-update-eyebrow';
    eyebrow.textContent = 'MUDANÇAS INCLUÍDAS';
    const heading = document.createElement('h2');
    heading.id = 'site-update-title';
    heading.textContent = update.title;
    const changes = document.createElement('ul');
    changes.id = 'site-update-copy';
    changes.className = 'site-update-changes';
    const entries = String(update.body || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    for (const entry of entries) {
      const item = document.createElement('li');
      item.textContent = entry.replace(/^(?:[-*•]|\d+[.)])\s*/, '');
      changes.append(item);
    }
    const acknowledge = document.createElement('button');
    acknowledge.className = 'site-update-acknowledge';
    acknowledge.type = 'button';
    acknowledge.textContent = 'Entendi';
    dialog.append(close, brand, eyebrow, heading, changes, acknowledge);
    overlay.append(dialog);
    document.body.append(overlay);
    localStorage.setItem(countKey, String(displayed + 1));

    const dismiss = () => overlay.remove();
    close.addEventListener('click', dismiss);
    acknowledge.addEventListener('click', dismiss);
    overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && overlay.isConnected) dismiss(); });
    acknowledge.focus();
  } catch {
    // Avisos são opcionais; falha de rede ou armazenamento não deve afetar a página.
  }
};

void initializeUpdateNotice();

const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
const canonicalPath = currentPath === "/index.html"
  ? "/"
  : currentPath.replace(/\.html$/, "");

const initializeNavigation = () => {
  themeToggle = document.getElementById("theme-toggle");
  themeIcon = document.getElementById("theme-icon");
  setTheme(localStorage.getItem("theme"));
  themeToggle?.addEventListener("click", event => {
    event.stopImmediatePropagation();
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme);
    setTheme(theme);
  });
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("site-sidebar-backdrop");
  const openButton = document.getElementById("sidebar-toggle");
  const closeButton = document.getElementById("site-sidebar-close");
  const sidebarNav = sidebar?.querySelector(".site-sidebar-nav");
  const header = document.querySelector(".site-header");
  const sidebarPreferences = sidebar?.querySelector(".site-sidebar-preferences");
  const preferencesLabel = sidebarPreferences?.querySelector(".site-sidebar-label");
  const headerLinks = header?.querySelector(".header-primary-links");
  const headerNav = header?.querySelector(".header-main-nav");

  if (!sidebar || !backdrop || !openButton || !sidebarNav || !headerNav) return;

  if (canonicalPath !== "/editions") initializeBackToTop();
  document.getElementById("shared-nav-search")?.toggleAttribute("hidden", canonicalPath !== "/editions");
  if (canonicalPath === "/editions") headerNav.classList.add("header-main-nav-editions");

  [headerLinks, sidebarNav].forEach(container => {
    container?.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href").replace(/\/+$/, "") || "/";
      const isCurrentPage = href === canonicalPath;
      link.classList.toggle("active", isCurrentPage);
      if (isCurrentPage) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  });

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

const mountSharedNavigation = async () => {
  try {
    const response = await fetch("/navigation.html", { cache: "no-cache" });
    if (!response.ok) throw new Error("Navegação compartilhada indisponível.");
    const template = document.createElement("template");
    template.innerHTML = await response.text();
    const sharedHeader = template.content.querySelector(".site-header");
    const sharedSidebar = template.content.querySelector("#site-sidebar");
    const sharedBackdrop = template.content.querySelector("#site-sidebar-backdrop");
    const currentHeader = document.querySelector(".site-header");
    const currentSidebar = document.querySelector("#site-sidebar");
    const currentBackdrop = document.querySelector("#site-sidebar-backdrop");
    if (!sharedHeader || !sharedSidebar || !sharedBackdrop || !currentHeader || !currentSidebar) return;
    currentHeader.replaceWith(sharedHeader);
    currentSidebar.replaceWith(sharedSidebar);
    if (currentBackdrop) currentBackdrop.replaceWith(sharedBackdrop);
    else document.body.append(sharedBackdrop);
    window.dispatchEvent(new CustomEvent("site:navigation-ready"));
    initializeNavigation();
  } catch (error) {
    console.error("Não foi possível carregar a navegação compartilhada.", error);
    initializeNavigation();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountSharedNavigation, { once: true });
} else {
  void mountSharedNavigation();
}
