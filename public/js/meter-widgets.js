(() => {
  const initializeScaledWidgets = () => {
    document.querySelectorAll('.meter-widget-frame-scaled').forEach(frame => {
      const iframe = frame.querySelector('.scaled-meter-widget');
      if (!iframe) return;

      const width = Number(iframe.dataset.widgetWidth) || 728;
      const height = Number(iframe.dataset.widgetHeight) || 228;

      const fitWidget = () => {
        const availableWidth = Math.max(frame.clientWidth, 1);
        const scale = Math.min(1, availableWidth / width);

        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
        iframe.style.zoom = String(scale);
        frame.style.height = `${height * scale}px`;
      };

      fitWidget();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(fitWidget);
        observer.observe(frame);
      } else {
        window.addEventListener('resize', fitWidget, { passive: true });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScaledWidgets, { once: true });
  } else {
    initializeScaledWidgets();
  }
})();
