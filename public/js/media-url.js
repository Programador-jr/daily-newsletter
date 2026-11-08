(function configureMediaUrls(global) {
  const configuredBase = typeof global.MEDIA_BASE_URL === 'string' ? global.MEDIA_BASE_URL.trim() : '';
  const defaultBase = 'https://pub-fcf4bc76fe3b4643b8c8b2c76bc61ad1.r2.dev';
  const mediaPrefixes = /^(?:countries|personalities|parties|presidents|external\/wikimedia)\//i;
  const base = (configuredBase || defaultBase).replace(/\/+$/, '');

  global.mediaUrl = function mediaUrl(value) {
    if (typeof value !== 'string' || !value || !base) return value;
    if (/^(?:https?:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value)) return value;
    const normalized = value.replace(/^\/+/, '');
    if (!mediaPrefixes.test(normalized)) return value;
    return `${base}/${normalized}`;
  };

  global.externalMediaUrl = function externalMediaUrl(value) {
    if (typeof value !== 'string' || !value) return value;
    const match = value.match(/(?:Special:FilePath\/|external\/wikimedia\/)([^?#]+)$/i);
    let fileName = value;
    if (match) {
      try {
        fileName = decodeURIComponent(match[1]).replaceAll('_', ' ');
      } catch {
        fileName = match[1];
      }
    } else if (/[/\\]/.test(value) || !/\.(?:jpe?g|png|webp|gif|avif)$/i.test(value)) {
      return value;
    }
    return `${base}/external/wikimedia/${encodeURIComponent(fileName)}`;
  };
})(window);
