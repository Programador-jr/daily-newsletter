(() => {
  const initializeScaledWidgets = () => {
    document.querySelectorAll('.meter-widget-frame-scaled').forEach(frame => {
      const iframe = frame.querySelector('.scaled-meter-widget');
      if (!iframe) return;

      const width = Number(iframe.dataset.widgetWidth) || 728;
      const height = Number(iframe.dataset.widgetHeight) || 228;

      iframe.style.setProperty('--meter-widget-width', `${width}px`);
      iframe.style.setProperty('--meter-widget-height', `${height}px`);

      const fitWidget = () => {
        const availableWidth = Math.max(
          frame.getBoundingClientRect().width,
          frame.parentElement?.getBoundingClientRect().width || 0,
          1
        );
        const scale = Math.min(1, availableWidth / width);

        frame.style.height = `${height * scale}px`;
        iframe.style.setProperty('--meter-widget-scale', String(scale));
      };

      fitWidget();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(fitWidget);
        observer.observe(frame);
        observer.observe(frame.parentElement);
      } else {
        window.addEventListener('resize', fitWidget, { passive: true });
      }

      window.addEventListener('load', fitWidget, { once: true });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScaledWidgets, { once: true });
  } else {
    initializeScaledWidgets();
  }
})();
