'use strict';

const setPublicCache = (res, maxAgeSeconds, staleWhileRevalidateSeconds) => {
  if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds < 0) {
    throw new RangeError('maxAgeSeconds must be a non-negative integer.');
  }
  if (!Number.isInteger(staleWhileRevalidateSeconds) || staleWhileRevalidateSeconds < 0) {
    throw new RangeError('staleWhileRevalidateSeconds must be a non-negative integer.');
  }

  // Keep browser caches revalidating while allowing the Vercel/shared CDN cache to reuse public data.
  res.setHeader(
    'Cache-Control',
    `public, max-age=0, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
  );
};

module.exports = { setPublicCache };
