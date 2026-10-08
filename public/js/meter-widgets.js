(() => {
  const initializeScaledWidgets = () => {
    document.querySelectorAll('.meter-widget-frame-scaled').forEach(frame => {
      const iframe = frame.querySelector('.scaled-meter-widget');
      if (!iframe) return;

      const fitWidget = () => {
        const width = Number(iframe.dataset.widgetWidth) || 728;
        const height = Number(iframe.dataset.widgetHeight) || 228;
        const scale = Math.min(1, frame.clientWidth / width);
        frame.style.height = `${height * scale}px`;
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
        iframe.style.setProperty('--meter-widget-scale', String(scale));
      };

      if ('ResizeObserver' in window) {
        new ResizeObserver(fitWidget).observe(frame);
      } else {
        window.addEventListener('resize', fitWidget, { passive: true });
      }
      fitWidget();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScaledWidgets, { once: true });
  } else {
    initializeScaledWidgets();
  }
})();
