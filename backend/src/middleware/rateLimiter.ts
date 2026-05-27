import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const rateLimitDisabled = env.DISABLE_RATE_LIMIT === 'true';

if (rateLimitDisabled) {
  console.warn('⚠️  Rate limiting is DISABLED via DISABLE_RATE_LIMIT=true');
}

const make = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max: rateLimitDisabled ? 1_000_000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'unknown',
    message: { success: false, code: 'RATE_LIMITED', message },
    skip: (req) => rateLimitDisabled || req.method === 'OPTIONS',
  });

export const rateLimiter = make(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX_REQUESTS,
  'Too many requests, please try again later.',
);

export const authRateLimiter = make(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please wait 15 minutes.',
);

export const passwordResetLimiter = make(
  15 * 60 * 1000,
  5,
  'Too many password reset attempts. Please wait 15 minutes.',
);

export const paymentRateLimiter = make(
  60 * 1000,
  5,
  'Too many payment requests. Please wait a moment.',
);

export const orderCreateLimiter = make(
  60 * 60 * 1000,
  10,
  'Too many orders placed. Please wait before trying again.',
);

export const reviewCreateLimiter = make(
  60 * 60 * 1000,
  5,
  'Too many reviews submitted. Please try again later.',
);

export const couponRateLimiter = make(
  15 * 60 * 1000,
  30,
  'Too many coupon attempts. Please wait before trying again.',
);

export const searchRateLimiter = make(
  60 * 1000,
  60,
  'Search rate limit exceeded. Please slow down.',
);

export const uploadRateLimiter = make(
  60 * 1000,
  20,
  'Upload limit reached. Please try again later.',
);

export const aiAnalysisRateLimiter = make(
  60 * 1000,
  3,
  'AI analysis limit: 3 requests per minute.',
);

export const contactRateLimiter = make(
  60 * 60 * 1000,
  5,
  'Too many contact submissions. Please try again later.',
);
