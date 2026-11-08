(() => {
  const OVERLAY_ID = "page-loading-overlay";
  const FALLBACK_TIMEOUT = 12000;
  // A navegação mostra o overlay antes de a página sair. Se ela não sair
  // (download, navegação cancelada, link tratado por JS), o overlay some sozinho.
  const NAVIGATION_TIMEOUT = 8000;
  let initialLoadFinished = false;
  let fallbackTimer = null;
  let navigationTimer = null;
  let windowLoadFinished = document.readyState === "complete";
  let pendingFetches = 0;
  let skeletonRefreshQueued = false;

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
      </div>`;

    (document.body || document.documentElement).append(overlay);
    return overlay;
  };

  const show = () => {
    const overlay = getOverlay();
    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("page-loader-active");
  };

  const clearNavigationTimer = () => {
    if (navigationTimer) window.clearTimeout(navigationTimer);
    navigationTimer = null;
  };

  const showForNavigation = () => {
    show();
    clearNavigationTimer();
    navigationTimer = window.setTimeout(hide, NAVIGATION_TIMEOUT);
  };

  const hide = () => {
    clearNavigationTimer();
    const overlay = getOverlay();
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("page-loader-active");
  };

  const finishInitialLoad = (force = false) => {
    if (initialLoadFinished) return;
    if (!force && (!windowLoadFinished || pendingFetches > 0)) return;
    initialLoadFinished = true;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    hide();
  };

  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  if (nativeFetch) {
    window.fetch = (...args) => {
      pendingFetches += 1;
      return nativeFetch(...args).finally(() => {
        pendingFetches = Math.max(0, pendingFetches - 1);
        finishInitialLoad();
      });
    };
  }

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

  // Create the overlay as soon as this shared script runs, before page scripts
  // start their requests. The safety timeout prevents a missing asset from
  // trapping the visitor behind a permanent overlay.
  show();
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
      if (!event.defaultPrevented) showForNavigation();
    }, 0);
  }, true);

  window.addEventListener("beforeunload", showForNavigation);
  window.addEventListener("pageshow", event => {
    // Voltar/avançar pode restaurar a página do cache com o overlay da saída.
    if (event.persisted) hide();
    finishInitialLoad();
  });
  window.addEventListener("load", () => {
    windowLoadFinished = true;
    finishInitialLoad();
  }, { once: true });

  if (document.readyState === "complete") finishInitialLoad();
  fallbackTimer = window.setTimeout(() => {
    if (!initialLoadFinished) finishInitialLoad(true);
  }, FALLBACK_TIMEOUT);

  window.pageLoader = Object.freeze({ show, hide, ready: finishInitialLoad });
  window.pageSkeleton = Object.freeze({ refresh: refreshSkeletons });
})();
