(() => {
  const IMPOSTOMETRO_SIZES = [
    { width: 320, height: 80 },
    { width: 430, height: 157 },
    { width: 590, height: 191 },
    { width: 635, height: 211 },
    { width: 728, height: 228 }
  ];

  const initializeWidgets = () => {
    document.querySelectorAll('.impostometro-widget').forEach(iframe => {
      const frame = iframe.closest('.meter-widget-frame-scaled');
      if (!frame) return;

      const updateSize = () => {
        const availableWidth = frame.getBoundingClientRect().width;

        let size = IMPOSTOMETRO_SIZES[0];

        for (const candidate of IMPOSTOMETRO_SIZES) {
          if (candidate.width <= availableWidth) {
            size = candidate;
          } else {
            break;
          }
        }

        iframe.width = String(size.width);
        iframe.height = String(size.height);
        iframe.style.width = `${size.width}px`;
        iframe.style.height = `${size.height}px`;
        iframe.style.transform = 'none';

        if (availableWidth < size.width) {
          const scale = availableWidth / size.width;
          iframe.style.transform = `scale(${scale})`;
          iframe.style.transformOrigin = 'top center';
        }
      };

      updateSize();

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(updateSize);
        observer.observe(frame);
      } else {
        window.addEventListener('resize', updateSize, { passive: true });
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets, { once: true });
  } else {
    initializeWidgets();
  }
})();
