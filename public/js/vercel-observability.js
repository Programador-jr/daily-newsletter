(() => {
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (localHosts.has(window.location.hostname)) return;

  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  window.si = window.si || function () {
    (window.siq = window.siq || []).push(arguments);
  };

  const scripts = [
    '/_vercel/insights/script.js',
    '/_vercel/speed-insights/script.js'
  ];

  for (const src of scripts) {
    if (document.querySelector(`script[src="${src}"]`)) continue;
    const script = document.createElement('script');
    script.defer = true;
    script.src = src;
    document.head.append(script);
  }
})();