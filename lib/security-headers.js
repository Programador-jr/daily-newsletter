'use strict';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // The public pages still contain small inline bootstrap scripts (analytics and
  // the subscription status page). Keep them working while restricting scripts
  // to this origin. Removing those inline blocks allows dropping 'unsafe-inline'.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
  "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'self'"
];

function isHttpsRequest(req, environment) {
  if (environment.NODE_ENV === 'production') return true;
  if (req.secure) return true;
  return String(req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function buildContentSecurityPolicy({ upgradeInsecureRequests = false } = {}) {
  const directives = [...CSP_DIRECTIVES];
  if (upgradeInsecureRequests) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

function securityHeaders(req, res, next) {
  const environment = process.env;
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy({
    upgradeInsecureRequests: isHttpsRequest(req, environment)
  }));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (isHttpsRequest(req, environment)) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

module.exports = { buildContentSecurityPolicy, securityHeaders };
