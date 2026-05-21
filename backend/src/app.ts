import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';

import { env } from './config/env';
import { logger } from './utils/logger';
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestId } from './middleware/requestId';
import { securityHeaders } from './middleware/securityHeaders';
import { router } from './router';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy (for Nginx / load balancer)
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://cdn.elva.in', 'https://*.amazonaws.com'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'https://api.razorpay.com'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Compression
  app.use(compression());

  const isProd = env.NODE_ENV === 'production';

  // HTTP request logger
  app.use(
    pinoHttp({
      logger: logger as any,
      autoLogging: env.NODE_ENV !== 'test',
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["x-api-key"]',
          'req.headers["x-csrf-token"]',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req) =>
          isProd
            ? { id: req.id, method: req.method, url: req.url }
            : { id: req.id, method: req.method, url: req.url, headers: req.headers },
        res: (res) =>
          isProd ? { statusCode: res.statusCode } : { statusCode: res.statusCode, headers: res.headers },
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        if (res.statusCode >= 300) return 'silent';
        return 'info';
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} — ${err.message}`,
    }),
  );

  // Security middleware
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(securityHeaders);
  app.use(requestId);

  // Rate limiting
  app.use(`/api/${env.API_VERSION}`, rateLimiter);
  app.use(`/api/${env.API_VERSION}/auth`, authRateLimiter);

  // Routes
  app.use(`/api/${env.API_VERSION}`, router);

  // Health check (bypasses rate limiter)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ELVA API', timestamp: new Date().toISOString() });
  });

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
