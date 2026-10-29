(() => {
  // Endereços locais e de rede privada (acesso por IP na LAN) não devem tentar
  // carregar os scripts de analytics, que só existem quando hospedado na Vercel.
  const LOCAL_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,
    /^0\.0\.0\.0$/,
    /^\[?::1\]?$/,
    /^f[cd][0-9a-f]{2}:/i,
    /^fe80:/i
  ];
  const isLocalHost = host => LOCAL_HOST_PATTERNS.some(pattern => pattern.test(host));
  if (isLocalHost(window.location.hostname)) return;

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