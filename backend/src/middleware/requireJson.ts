import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * Requires Content-Type: application/json on state-changing requests.
 * Blocks CSRF via form-based cross-origin submissions and prevents
 * content-sniffing attacks on API endpoints.
 * Skip on multipart/form-data routes (file uploads).
 */
export const requireJson = (req: Request, _res: Response, next: NextFunction): void => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) { next(); return; }

  // No body — nothing to validate, allow through (e.g. /auth/refresh, /auth/logout)
  const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
  if (!hasBody) { next(); return; }

  const ct = req.headers['content-type'] ?? '';
  if (ct.includes('application/json') || ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
    next();
    return;
  }
  throw AppError.badRequest('Content-Type must be application/json');
};
