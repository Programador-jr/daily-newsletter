(() => {
  const WIDGET_SIZES = [
    { width: 320, height: 80 },
    { width: 430, height: 157 },
    { width: 590, height: 191 },
    { width: 635, height: 211 },
    { width: 728, height: 228 }
  ];

  const initializeScaledWidgets = () => {
    document.querySelectorAll('.impostometro-responsive-widget').forEach(iframe => {
      const frame = iframe.closest('.meter-widget-frame-scaled');
      if (!frame) return;

      const fitWidget = () => {
        const availableWidth = Math.max(frame.clientWidth, 1);
        const nativeSize = [...WIDGET_SIZES]
          .reverse()
          .find(size => size.width <= availableWidth) || WIDGET_SIZES[0];

        iframe.width = String(nativeSize.width);
        iframe.height = String(nativeSize.height);
        iframe.style.width = `${nativeSize.width}px`;
        iframe.style.height = `${nativeSize.height}px`;

        if (availableWidth < WIDGET_SIZES[0].width) {
          const scale = availableWidth / WIDGET_SIZES[0].width;
          iframe.style.transform = `scale(${scale})`;
          iframe.style.transformOrigin = 'top left';
          frame.style.height = `${nativeSize.height * scale}px`;
          frame.style.justifyContent = 'flex-start';
        } else {
          iframe.style.transform = 'none';
          iframe.style.transformOrigin = 'top center';
          frame.style.height = `${nativeSize.height}px`;
          frame.style.justifyContent = 'center';
        }
      };

      fitWidget();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(fitWidget);
        observer.observe(frame);
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
