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

const allowedPalettes = new Set(["green", "blue", "purple", "red", "orange", "gray"]);
const paletteDetails = {
  green: { name: "King's Green", color: "#064e46" },
  blue: { name: "Ocean Blue", color: "#2563eb" },
  purple: { name: "Royal Purple", color: "#7c3aed" },
  red: { name: "Imperial Red", color: "#D50032" },
  orange: { name: "Amber", color: "#c65d16" },
  gray: { name: "Mission Gold", color: "#f5c518" }
};
const setPalette = palette => {
  const normalizedPalette = allowedPalettes.has(palette) ? palette : "green";
  const details = paletteDetails[normalizedPalette];
  document.documentElement.setAttribute("data-palette", normalizedPalette);
  document.querySelectorAll("[data-palette-choice]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.paletteChoice === normalizedPalette));
  });
  const currentName = document.getElementById("site-palette-current-name");
  const currentSwatch = document.getElementById("site-palette-current-swatch");
  if (currentName) currentName.textContent = details.name;
  if (currentSwatch) currentSwatch.style.setProperty("--swatch", details.color);
};

setTheme(localStorage.getItem("theme"));
setPalette(localStorage.getItem("site-palette"));
window.addEventListener("storage", event => {
  if (event.key === "theme") setTheme(event.newValue);
  if (event.key === "site-palette") setPalette(event.newValue);
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

const appendMarkdownInline = (parent, source) => {
  const tokenPattern = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*\*.+?\*\*\*|___.+?___|\*\*(?:[^*]+|\*[^*]+\*)+\*\*|__(?:[^_]+|_[^_]+_)+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\x60[^\x60]+\x60)/g;
  let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    if (match.index > cursor) parent.append(document.createTextNode(source.slice(cursor, match.index)));
    const token = match[0];
    let element;
    if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        try {
          const url = new URL(link[2]);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            element = document.createElement('a');
            element.href = url.href;
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
            appendMarkdownInline(element, link[1]);
          }
        } catch { /* link inválido vira texto literal */ }
      }
    } else if (token.startsWith('***') || token.startsWith('___')) {
      element = document.createElement('strong');
      const emphasis = document.createElement('em');
      appendMarkdownInline(emphasis, token.slice(3, -3));
      element.append(emphasis);
    } else if (token.startsWith('**') || token.startsWith('__')) {
      element = document.createElement('strong');
      appendMarkdownInline(element, token.slice(2, -2));
    } else if (token.startsWith('~~')) {
      element = document.createElement('del');
      appendMarkdownInline(element, token.slice(2, -2));
    } else if (token.startsWith('\x60')) {
      element = document.createElement('code');
      element.textContent = token.slice(1, -1);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      element = document.createElement('em');
      appendMarkdownInline(element, token.slice(1, -1));
    }
    parent.append(element || document.createTextNode(token));
    cursor = match.index + token.length;
  }
  if (cursor < source.length) parent.append(document.createTextNode(source.slice(cursor)));
};

const renderUpdateMarkdown = (container, markdown) => {
  container.replaceChildren();
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  let index = 0;
  const isListItem = line => /^\s{0,3}(?:[-*+](?:[ \t]+|$)|\d{1,9}[.)](?:[ \t]+|$))/.test(line);
  const isBlockStart = line => /^(#{1,4}\s|>\s?)/.test(line.trim()) || isListItem(line) || /^(?:[-*_][ \t]*){3,}$/.test(line.trim()) || line.trim().startsWith('\x60\x60\x60');
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    if (line.startsWith('\x60\x60\x60')) {
      index += 1;
      const codeLines = [];
      while (index < lines.length && !lines[index].trim().startsWith('\x60\x60\x60')) codeLines.push(lines[index++]);
      if (index < lines.length) index += 1;
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = codeLines.join('\n');
      pre.append(code);
      container.append(pre);
      continue;
    }
    if (/^(?:[-*_][ \t]*){3,}$/.test(line)) {
      container.append(document.createElement('hr'));
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const element = document.createElement('h' + Math.min(4, heading[1].length + 2));
      appendMarkdownInline(element, heading[2]);
      container.append(element);
      index += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const quote = document.createElement('blockquote');
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        const paragraph = document.createElement('p');
        appendMarkdownInline(paragraph, lines[index++].trim().replace(/^>\s?/, ''));
        quote.append(paragraph);
      }
      container.append(quote);
      continue;
    }
    const listMatch = line.match(/^\s{0,3}(?:([-*+])(?:[ \t]+|$)|(\d{1,9})[.)](?:[ \t]+|$))(.*)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s{0,3}(?:([-*+])(?:[ \t]+|$)|(\d{1,9})[.)](?:[ \t]+|$))(.*)$/);
        if (!itemMatch || Boolean(itemMatch[2]) !== ordered) break;
        const item = document.createElement('li');
        appendMarkdownInline(item, itemMatch[3].trim());
        list.append(item);
        index += 1;
      }
      container.append(list);
      continue;
    }
    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraphLines.push(lines[index++].trim());
    }
    const paragraph = document.createElement('p');
    appendMarkdownInline(paragraph, paragraphLines.join(' '));
    container.append(paragraph);
  }
};

const initializeUpdateNotice = async headerActions => {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin.html') return;
  if (!headerActions || headerActions.querySelector('.site-update-notice')) return;
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

    const countKey = 'kings-newsletter:notice:' + browserId + ':' + update.activationId;
    const displayed = Number(localStorage.getItem(countKey) || 0);
    if (!Number.isSafeInteger(displayed) || displayed >= update.maxDisplays) return;

    const notice = document.createElement('div');
    notice.className = 'site-update-notice';
    const trigger = document.createElement('button');
    trigger.className = 'site-update-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Abrir nota de lançamento');
    trigger.setAttribute('aria-controls', 'site-update-panel');
    trigger.setAttribute('aria-expanded', 'false');
    const bell = document.createElement('i');
    bell.className = 'fas fa-bell';
    bell.setAttribute('aria-hidden', 'true');
    const indicator = document.createElement('span');
    indicator.className = 'site-update-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    trigger.append(bell, indicator);

    const panel = document.createElement('aside');
    panel.className = 'site-update-panel';
    panel.id = 'site-update-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', 'site-update-title');
    const header = document.createElement('div');
    header.className = 'site-update-panel-header';
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
    const close = document.createElement('button');
    close.className = 'site-update-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar nota de lançamento');
    close.textContent = '×';
    header.append(brand, close);
    const eyebrow = document.createElement('span');
    eyebrow.className = 'site-update-eyebrow';
    eyebrow.textContent = 'MUDANÇAS INCLUÍDAS';
    const heading = document.createElement('h2');
    heading.id = 'site-update-title';
    heading.textContent = update.title;
    const body = document.createElement('div');
    body.id = 'site-update-copy';
    body.className = 'site-update-markdown';
    renderUpdateMarkdown(body, update.body);
    panel.append(header, eyebrow, heading, body);
    notice.append(trigger, panel);
    headerActions.append(notice);
    let displayCount = displayed;
    let cleanupListeners = () => {};

    const collapse = () => {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (displayCount >= update.maxDisplays) {
        notice.remove();
        cleanupListeners();
      }
    };
    const expand = () => {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      displayCount += 1;
      localStorage.setItem(countKey, String(displayCount));
    };

    trigger.addEventListener('click', () => {
      if (panel.hidden) expand();
      else collapse();
    });
    close.addEventListener('click', () => {
      collapse();
      if (notice.isConnected) trigger.focus();
      else headerActions.querySelector('button')?.focus();
    });
    const onKeydown = event => {
      if (event.key === 'Escape' && !panel.hidden) {
        collapse();
        if (notice.isConnected) trigger.focus();
        else headerActions.querySelector('button')?.focus();
      }
    };
    const onDocumentClick = event => {
      if (!panel.hidden && !notice.contains(event.target)) collapse();
    };
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onDocumentClick);
    cleanupListeners = () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onDocumentClick);
    };
  } catch {
    // Avisos são opcionais; falha de rede ou armazenamento não deve afetar a página.
  }
};

const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
const canonicalPath = currentPath === "/index.html"
  ? "/"
  : currentPath.replace(/\.html$/, "");

const initializeNavigation = () => {
  themeToggle = document.getElementById("theme-toggle");
  themeIcon = document.getElementById("theme-icon");
  setTheme(localStorage.getItem("theme"));
  setPalette(localStorage.getItem("site-palette"));
  const paletteToggle = document.getElementById("site-palette-toggle");
  const paletteOptions = document.getElementById("site-palette-options");
  let paletteOptionsAnimation = null;
  const paletteMotionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
  const clearPaletteAnimationStyles = () => {
    ["height", "opacity", "padding-top", "padding-bottom", "margin-top", "overflow"].forEach(property => {
      paletteOptions.style.removeProperty(property);
    });
  };
  const setPalettePickerExpanded = expanded => {
    if (!paletteToggle || !paletteOptions) return;
    const wasExpanded = paletteToggle.getAttribute("aria-expanded") === "true";
    if (wasExpanded === expanded && !paletteOptionsAnimation) return;

    const currentStyles = getComputedStyle(paletteOptions);
    const currentHeight = paletteOptions.hidden ? 0 : paletteOptions.getBoundingClientRect().height;
    const currentOpacity = paletteOptions.hidden ? 0 : Number.parseFloat(currentStyles.opacity) || 1;
    const currentPaddingTop = paletteOptions.hidden ? "0px" : currentStyles.paddingTop;
    const currentPaddingBottom = paletteOptions.hidden ? "0px" : currentStyles.paddingBottom;
    const currentMarginTop = paletteOptions.hidden ? "0px" : currentStyles.marginTop;

    if (paletteOptionsAnimation) {
      paletteOptionsAnimation.cancel();
      paletteOptionsAnimation = null;
    }
    paletteToggle.setAttribute("aria-expanded", String(expanded));

    if (paletteMotionDuration === 0) {
      paletteOptions.hidden = !expanded;
      clearPaletteAnimationStyles();
      return;
    }

    if (expanded) paletteOptions.hidden = false;
    const targetStyles = getComputedStyle(paletteOptions);
    const targetHeight = expanded ? paletteOptions.scrollHeight : 0;
    const targetPaddingTop = expanded ? targetStyles.paddingTop : "0px";
    const targetPaddingBottom = expanded ? targetStyles.paddingBottom : "0px";
    const targetMarginTop = expanded ? targetStyles.marginTop : "0px";

    paletteOptions.style.overflow = "hidden";
    paletteOptions.style.height = `${currentHeight}px`;
    paletteOptions.style.opacity = String(currentOpacity);
    paletteOptions.style.paddingTop = currentPaddingTop;
    paletteOptions.style.paddingBottom = currentPaddingBottom;
    paletteOptions.style.marginTop = currentMarginTop;
    void paletteOptions.offsetHeight;

    paletteOptionsAnimation = paletteOptions.animate([
      {
        height: `${currentHeight}px`,
        opacity: currentOpacity,
        paddingTop: currentPaddingTop,
        paddingBottom: currentPaddingBottom,
        marginTop: currentMarginTop,
        transform: expanded ? "translateY(-5px)" : "translateY(0)"
      },
      {
        height: `${targetHeight}px`,
        opacity: expanded ? 1 : 0,
        paddingTop: targetPaddingTop,
        paddingBottom: targetPaddingBottom,
        marginTop: targetMarginTop,
        transform: expanded ? "translateY(0)" : "translateY(-5px)"
      }
    ], { duration: paletteMotionDuration, easing: "cubic-bezier(.4, 0, .2, 1)" });
    const activeAnimation = paletteOptionsAnimation;
    activeAnimation.onfinish = () => {
      if (paletteOptionsAnimation !== activeAnimation) return;
      paletteOptions.hidden = !expanded;
      clearPaletteAnimationStyles();
      paletteOptionsAnimation = null;
    };
  };
  paletteToggle?.addEventListener("click", () => {
    setPalettePickerExpanded(paletteToggle.getAttribute("aria-expanded") !== "true");
  });
  document.querySelectorAll("[data-palette-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const palette = button.dataset.paletteChoice;
      if (!allowedPalettes.has(palette)) return;
      localStorage.setItem("site-palette", palette);
      setPalette(palette);
      setPalettePickerExpanded(false);
    });
  });
  paletteOptions?.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setPalettePickerExpanded(false);
      paletteToggle?.focus();
    }
  });
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
  const palettePicker = sidebarPreferences?.querySelector(".site-palette-picker");
  const headerLinks = header?.querySelector(".header-primary-links");
  const headerNav = header?.querySelector(".header-main-nav");

  if (!sidebar || !backdrop || !openButton || !sidebarNav || !headerNav) return;

  if (canonicalPath !== "/editions") initializeBackToTop();
  document.getElementById("shared-nav-search")?.toggleAttribute("hidden", canonicalPath !== "/editions");
  if (canonicalPath === "/editions") headerNav.classList.add("header-main-nav-editions");

  const sidebarCatalogTabs = new Set(["personalidades", "paises", "partidos"]);
  const currentCanonicalPath = () => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    return path === "/index.html" ? "/" : path.replace(/\.html$/, "");
  };
  const catalogTabFromLocation = () => {
    const path = currentCanonicalPath();
    if (path === "/valores") return "ideologias";
    if (path !== "/catalogo-politico") return null;
    const requested = new URLSearchParams(window.location.search).get("catalogo");
    return sidebarCatalogTabs.has(requested) ? requested : "ideologias";
  };
  const syncActiveLinks = () => {
    const catalogTab = catalogTabFromLocation();
    const activePath = currentCanonicalPath();
    [headerLinks, sidebarNav].forEach(container => {
      container?.querySelectorAll("a[href]").forEach(link => {
        const href = (link.getAttribute("href") || "/").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
        const catalogKey = link.dataset.sidebarCatalog || null;
        let isCurrentPage;
        if (catalogKey) isCurrentPage = catalogKey === catalogTab;
        else if (href === "/catalogo-politico" && catalogTab) isCurrentPage = catalogTab === "ideologias";
        else isCurrentPage = href === activePath;
        link.classList.toggle("active", isCurrentPage);
        if (isCurrentPage) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    });
  };
  syncActiveLinks();
  window.addEventListener("site:catalog-change", syncActiveLinks);

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
  if (palettePicker) topPreferences.append(palettePicker);
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
  void initializeUpdateNotice(headerActions);
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
