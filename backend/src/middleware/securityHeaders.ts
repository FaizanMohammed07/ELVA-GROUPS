import { Request, Response, NextFunction } from 'express';

/**
 * Additional security headers not covered by helmet.
 * Runs after helmet so these values take precedence where needed.
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Prevent MIME-type sniffing (already in helmet but explicit here for clarity)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Deny framing (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // Legacy XSS filter (most modern browsers ignore this but doesn't hurt)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Block browser features not used by a gifting platform API
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
  );

  // Never cache auth or sensitive API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Prevent information disclosure
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Cross-origin policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
};

/**
 * Applied only to cacheable public endpoints (products, categories, etc.)
 * to allow CDN/browser caching while protecting sensitive routes.
 */
export const cacheableHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  next();
};
