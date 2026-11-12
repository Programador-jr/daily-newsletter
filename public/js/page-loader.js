(() => {
  const OVERLAY_ID = "page-loading-overlay";
  // O overlay inicial sai assim que o HTML estiver pronto: imagens, fontes e
  // dados continuam chegando sob os skeletons de cada seção. O limite só
  // protege contra um DOMContentLoaded que nunca chega.
  const FALLBACK_TIMEOUT = 3000;
  // A navegação mostra o overlay antes de a página sair. Se ela não sair
  // (download, navegação cancelada, link tratado por JS), o overlay some sozinho.
  const NAVIGATION_TIMEOUT = 8000;
  // Navegações rápidas trocam de página antes deste atraso, sem piscar a coroa.
  const NAVIGATION_SHOW_DELAY = 150;
  let initialLoadFinished = false;
  let fallbackTimer = null;
  let navigationTimer = null;
  let navigationShowTimer = null;
  let skeletonRefreshQueued = false;

  // Cada seção do site ganha uma vinheta própria sob a coroa: o leitor vê para
  // onde está indo (ou onde está) enquanto a página carrega.
  const THEMES = [
    { key: "history", label: "História", match: /^\/(historia|presidentes)(\/|$)/ },
    { key: "axes", label: "12 Eixos", match: /^\/(teste-politico|resultado-politico|results-12axes|catalogo-politico|personalidades|paises|partidos|comparar)(\/|$)/ },
    { key: "politics", label: "Política", match: /^\/(politica|ideologias|livros|fascismo-nazismo)(\/|$)/ },
    { key: "state", label: "Estado brasileiro", match: /^\/(como-funciona-estado|estado-brasileiro|tres-poderes|cargos-publicos|politicas-publicas)(\/|$)/ },
    { key: "chart", label: "Economia", match: /^\/(economia|economy)(\/|$)/ },
    { key: "chart", label: "Dados públicos", match: /^\/(arrecadacao|impostometro|gastometro|gastos-publicos|gastos-parlamentares|como-fiscalizar)(\/|$)/ },
    { key: "sports", label: "Esportes", match: /^\/sports(\/|$)/ },
    { key: "news", label: "Edições", match: /^\/(editions|weekly)(\/|$)/ }
  ];
  const DEFAULT_THEME = { key: "news", label: "King's Newsletter" };

  // Vinhetas em SVG puro: aparecem antes de qualquer fonte de ícones carregar.
  const GLYPHS = {
    news: `<rect class="pl-line" x="6" y="5" width="36" height="3" rx="1.5"/><rect class="pl-line" x="6" y="11" width="30" height="3" rx="1.5"/><rect class="pl-line" x="6" y="17" width="22" height="3" rx="1.5"/>`,
    chart: `<path class="pl-axis" d="M5 21H43"/><rect class="pl-bar" x="9" y="11" width="5" height="9" rx="1"/><rect class="pl-bar" x="18" y="7" width="5" height="13" rx="1"/><rect class="pl-bar" x="27" y="13" width="5" height="7" rx="1"/><rect class="pl-bar" x="36" y="3" width="5" height="17" rx="1"/>`,
    history: `<path class="pl-axis" d="M4 14H44"/><circle class="pl-tick" cx="10" cy="14" r="1.6"/><circle class="pl-tick" cx="20" cy="14" r="1.6"/><circle class="pl-tick" cx="30" cy="14" r="1.6"/><circle class="pl-tick" cx="40" cy="14" r="1.6"/><circle class="pl-cursor" cx="10" cy="14" r="3.6"/>`,
    politics: `<path class="pl-axis" d="M24 5V21M17 21H31"/><g class="pl-beam"><path class="pl-axis" d="M10 8H38"/><path class="pl-pan" d="M6 14a4 2.4 0 0 0 8 0Z"/><path class="pl-pan" d="M34 14a4 2.4 0 0 0 8 0Z"/><path class="pl-thin" d="M10 8 6 14M10 8l4 6M38 8l-4 6M38 8l4 6"/></g>`,
    state: `<path class="pl-pan" d="M8 8 24 2l16 6Z"/><rect class="pl-column" x="11" y="10" width="4" height="9"/><rect class="pl-column" x="22" y="10" width="4" height="9"/><rect class="pl-column" x="33" y="10" width="4" height="9"/><path class="pl-axis" d="M7 21H41"/>`,
    axes: `<circle class="pl-ring" cx="24" cy="12" r="9.5"/><path class="pl-thin" d="M24 2.5v3M24 18.5v3M14.5 12h3M30.5 12h3"/><g class="pl-needle"><path class="pl-pan" d="M24 5.5 26.2 12h-4.4Z"/><path class="pl-tick" d="M24 18.5 21.8 12h4.4Z"/></g>`,
    sports: `<ellipse class="pl-shadow" cx="24" cy="21.5" rx="6" ry="1.4"/><g class="pl-ball"><circle class="pl-ring" cx="24" cy="9" r="6"/><path class="pl-pan" d="m24 6.2 2.6 1.9-1 3h-3.2l-1-3Z"/></g>`
  };

  const normalizePath = pathname => (pathname || "/").replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1");
  const themeFor = pathname => {
    const path = normalizePath(pathname);
    return THEMES.find(theme => theme.match.test(path)) || DEFAULT_THEME;
  };

  const applyTheme = (overlay, pathname) => {
    const theme = themeFor(pathname);
    if (overlay.dataset.loaderTheme === theme.key && overlay.dataset.loaderLabel === theme.label) return;
    overlay.dataset.loaderTheme = theme.key;
    overlay.dataset.loaderLabel = theme.label;
    overlay.setAttribute("aria-label", `Carregando ${theme.label}`);
    const glyph = overlay.querySelector(".page-loading-glyph");
    const label = overlay.querySelector(".page-loading-label");
    if (glyph) glyph.innerHTML = GLYPHS[theme.key] || GLYPHS.news;
    if (label) label.textContent = theme.label;
  };

  const getOverlay = () => {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", "Carregando página");
    // Coroa do ícone (assets/icons/kings-newsletter-icon.png) redesenhada em SVG:
    // aparece sem esperar download e permite animar joias e base.
    overlay.innerHTML = `
      <div class="page-loading-mark" aria-hidden="true">
        <svg class="page-loading-crown" viewBox="200 320 1530 1280" focusable="false">
          <path class="page-loading-crown-body" d="M340 670 648 940 896 461 1178 940 1591 635 1452 1400H478Z"/>
          <circle class="page-loading-crown-jewel" cx="340" cy="670" r="120"/>
          <circle class="page-loading-crown-jewel" cx="896" cy="461" r="120"/>
          <circle class="page-loading-crown-jewel" cx="1591" cy="635" r="120"/>
          <path class="page-loading-crown-track" d="M513 1540H1418"/>
          <path class="page-loading-crown-progress" d="M513 1540H1418" pathLength="100"/>
        </svg>
      </div>
      <div class="page-loading-section" aria-hidden="true">
        <svg class="page-loading-glyph" viewBox="0 0 48 24" focusable="false"></svg>
        <span class="page-loading-label"></span>
      </div>`;

    (document.body || document.documentElement).append(overlay);
    applyTheme(overlay, window.location.pathname);
    return overlay;
  };

  const show = pathname => {
    const overlay = getOverlay();
    applyTheme(overlay, pathname || window.location.pathname);
    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("page-loader-active");
  };

  const clearNavigationTimer = () => {
    if (navigationTimer) window.clearTimeout(navigationTimer);
    if (navigationShowTimer) window.clearTimeout(navigationShowTimer);
    navigationTimer = null;
    navigationShowTimer = null;
  };

  let pendingNavigationPath = null;

  const showForNavigation = pathname => {
    clearNavigationTimer();
    if (typeof pathname === "string") pendingNavigationPath = pathname;
    navigationShowTimer = window.setTimeout(() => {
      navigationShowTimer = null;
      show(pendingNavigationPath || window.location.pathname);
      navigationTimer = window.setTimeout(hide, NAVIGATION_TIMEOUT);
    }, NAVIGATION_SHOW_DELAY);
  };

  const hide = () => {
    clearNavigationTimer();
    pendingNavigationPath = null;
    const overlay = getOverlay();
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("page-loader-active");
  };

  const finishInitialLoad = () => {
    if (initialLoadFinished) return;
    initialLoadFinished = true;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    hide();
  };

  const isNavigableInternalLink = anchor => {
    if (!anchor || (anchor.target && anchor.target !== "_self")) return false;
    if (anchor.hasAttribute("download")) return false;
    if (anchor.origin !== window.location.origin) return false;
    if (anchor.protocol !== "http:" && anchor.protocol !== "https:") return false;

    const current = new URL(window.location.href);
    const target = new URL(anchor.href, window.location.href);
    return target.pathname !== current.pathname || target.search !== current.search;
  };

  const isSkeletonImageCandidate = image => {
    if (image.closest(`#${OVERLAY_ID}, .logo, .brand, .login-card-mark`)) return false;
    return Boolean(
      image.getAttribute("loading") === "lazy"
      || image.src.startsWith("http")
      || image.matches(".gallery-image-wrap img, .mandate-portrait-image, .atlas-book-card-image")
    );
  };

  const prepareImageSkeleton = image => {
    if (!(image instanceof HTMLImageElement) || !isSkeletonImageCandidate(image)) return;
    image.classList.add("page-skeleton-image");

    const markLoaded = () => {
      image.classList.remove("is-loading");
      image.classList.add("is-loaded");
    };
    const markFailed = () => {
      image.classList.remove("is-loading");
      image.classList.add("is-error");
    };

    if (image.complete) {
      if (image.naturalWidth > 0) markLoaded();
      else markFailed();
      return;
    }

    if (image.classList.contains("is-loading")) return;
    image.classList.remove("is-error", "is-loaded");
    image.classList.add("is-loading");
    image.addEventListener("load", markLoaded, { once: true });
    image.addEventListener("error", markFailed, { once: true });
  };

  const refreshSkeletons = () => {
    skeletonRefreshQueued = false;
    document.querySelectorAll("img").forEach(prepareImageSkeleton);

    document.querySelectorAll(".data-loading, .catalog-loading, #tax-history").forEach(element => {
      const isLoading = element.matches(".data-loading, .catalog-loading")
        || element.getAttribute("aria-busy") === "true";
      element.classList.toggle("page-skeleton-block", isLoading);
    });

    document.querySelectorAll("[data-meter-value], [data-meter-rate], [data-meter-compact], [data-meter-share]")
      .forEach(element => {
        const isLoading = element.closest("[aria-busy='true']");
        element.classList.toggle("page-skeleton-value", Boolean(isLoading));
      });

    document.querySelectorAll("[data-meter-status], #economy-chart-status").forEach(element => {
      const isLoading = element.matches("[data-state='loading']")
        || /carregando|loading/i.test(element.textContent || "");
      element.classList.toggle("page-skeleton-line", isLoading);
    });

    document.querySelectorAll("#economy-history-chart").forEach(chart => {
      const isLoading = /carregando|loading/i.test(chart.textContent || "") && !chart.querySelector("path, polyline, line");
      chart.classList.toggle("page-skeleton-chart", isLoading);
    });
  };

  const queueSkeletonRefresh = () => {
    if (skeletonRefreshQueued) return;
    skeletonRefreshQueued = true;
    window.requestAnimationFrame(refreshSkeletons);
  };

  // Só cobre a página enquanto o HTML ainda está sendo lido; depois disso o
  // conteúdo aparece e os skeletons indicam o que ainda carrega.
  if (document.readyState === "loading") {
    show();
    document.addEventListener("DOMContentLoaded", finishInitialLoad, { once: true });
  } else {
    finishInitialLoad();
  }
  refreshSkeletons();

  const skeletonObserver = new MutationObserver(queueSkeletonRefresh);
  skeletonObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-busy", "data-state", "loading", "src"]
  });

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest("a");
    if (!isNavigableInternalLink(anchor)) return;
    // Decide depois que todos os handlers rodaram: cards e fichas usam links
    // reais, mas abrem o conteúdo na própria página com preventDefault().
    window.setTimeout(() => {
      if (!event.defaultPrevented) showForNavigation(anchor.pathname);
    }, 0);
  }, true);

  window.addEventListener("beforeunload", () => showForNavigation());
  window.addEventListener("pageshow", event => {
    // Voltar/avançar pode restaurar a página do cache com o overlay da saída.
    if (event.persisted) {
      pendingNavigationPath = null;
      hide();
    }
    finishInitialLoad();
  });

  if (!initialLoadFinished) fallbackTimer = window.setTimeout(finishInitialLoad, FALLBACK_TIMEOUT);

  window.pageLoader = Object.freeze({ show: () => show(), hide, ready: finishInitialLoad });
  window.pageSkeleton = Object.freeze({ refresh: refreshSkeletons });
})();
