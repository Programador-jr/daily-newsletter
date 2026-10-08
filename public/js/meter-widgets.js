(() => {
  const IMPOSTOMETRO_SIZES = [
    { width: 320, height: 80 },
    { width: 430, height: 157 },
    { width: 590, height: 191 },
    { width: 635, height: 211 },
    { width: 728, height: 228 }
  ];

  const getImpostometroSize = availableWidth => {
    return [...IMPOSTOMETRO_SIZES]
      .reverse()
      .find(size => availableWidth >= size.width) || IMPOSTOMETRO_SIZES[0];
  };

  const initializeImpostometro = () => {
    document.querySelectorAll('.impostometro-widget-frame').forEach(frame => {
      const iframe = frame.querySelector('.impostometro-native-widget');
      if (!iframe) return;

      const container = frame.parentElement;
      if (!container) return;

      const fitWidget = () => {
        const availableWidth = Math.max(container.clientWidth, 1);
        const { width, height } = getImpostometroSize(availableWidth);

        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
      };

      const scheduleFit = () => window.requestAnimationFrame(fitWidget);

      fitWidget();
      scheduleFit();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(scheduleFit);
        observer.observe(container);
      } else {
        window.addEventListener('resize', scheduleFit, { passive: true });
      }

      window.addEventListener('resize', scheduleFit, { passive: true });
      window.addEventListener('orientationchange', scheduleFit, { passive: true });

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleFit, { passive: true });
      }

      window.addEventListener('load', scheduleFit, { once: true });
    });
  };

  const initializeScaledWidgets = () => {
    document.querySelectorAll('.meter-widget-frame-scaled').forEach(frame => {
      const iframe = frame.querySelector('.scaled-meter-widget');
      if (!iframe) return;

      const width = Number(iframe.dataset.widgetWidth) || 728;
      const height = Number(iframe.dataset.widgetHeight) || 320;

      const fitWidget = () => {
        const availableWidth = Math.max(frame.clientWidth, 1);
        const scale = Math.min(1, availableWidth / width);

        frame.style.height = `${height * scale}px`;
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
        iframe.style.setProperty('--meter-widget-scale', String(scale));
      };

      const scheduleFit = () => window.requestAnimationFrame(fitWidget);

      fitWidget();
      scheduleFit();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(scheduleFit);
        observer.observe(frame);
      } else {
        window.addEventListener('resize', scheduleFit, { passive: true });
      }

      window.addEventListener('resize', scheduleFit, { passive: true });
      window.addEventListener('orientationchange', scheduleFit, { passive: true });

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleFit, { passive: true });
      }

      window.addEventListener('load', scheduleFit, { once: true });
    });
  };

  const initialize = () => {
    initializeImpostometro();
    initializeScaledWidgets();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
