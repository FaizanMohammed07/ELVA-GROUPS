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
import { rateLimiter, authRateLimiter, passwordResetLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestId } from './middleware/requestId';
import { securityHeaders } from './middleware/securityHeaders';
import { requireJson } from './middleware/requireJson';
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

  // CORS — build the allowed-origin set once at startup
  const buildAllowedOrigins = (): Set<string> => {
    const raw = [
      ...env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
      env.FRONTEND_URL,
    ].filter(Boolean);

    const set = new Set<string>(raw);

    // Auto-add www ↔ non-www variants so a single entry covers both
    raw.forEach((origin) => {
      try {
        const url = new URL(origin);
        if (url.hostname.startsWith('www.')) {
          const bare = `${url.protocol}//${url.hostname.slice(4)}${url.port ? `:${url.port}` : ''}`;
          set.add(bare);
        } else if (!url.hostname.includes('localhost')) {
          const www = `${url.protocol}//www.${url.hostname}${url.port ? `:${url.port}` : ''}`;
          set.add(www);
        }
      } catch { /* invalid URL — skip */ }
    });

    return set;
  };

  const allowedOrigins = buildAllowedOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        // No origin = same-origin request or server-to-server — always allow
        if (!origin) return callback(null, true);

        // Development: allow any localhost port (Vite, previews, devtools)
        const isLocalhostInDev =
          env.NODE_ENV === 'development' && /^https?:\/\/localhost(:\d+)?$/.test(origin);

        if (allowedOrigins.has(origin) || isLocalhostInDev) {
          return callback(null, true);
        }

        // Return 403 — do NOT throw; throwing escalates to 500 in Express
        const err = Object.assign(new Error(`CORS blocked: ${origin}`), { status: 403 });
        callback(err);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400, // preflight cache: 24 hours
    }),
  );

  // Absorb socket.io WebSocket upgrade probes from dev tools (VS Code Live Server, etc.)
  // Must be BEFORE pino-http so these never enter the logging pipeline.
  app.use('/socket.io', (_req: Request, res: Response) => res.status(200).end());

  // Body parsing — keep limits tight; uploads use multipart (multer) not JSON
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Compression
  app.use(compression());

  const isProd = env.NODE_ENV === 'production';

  // HTTP request logger
  app.use(
    pinoHttp({
      logger: logger as any,
      autoLogging: env.NODE_ENV === 'test'
        ? false
        : { ignore: (req) => (req.url ?? '').startsWith('/socket.io') },
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
  app.use(mongoSanitize({ replaceWith: '_' }));
  app.use(hpp());
  app.use(securityHeaders);
  app.use(requestId);

  // Enforce Content-Type on all state-changing API requests
  app.use(`/api/${env.API_VERSION}`, requireJson);

  // Rate limiting
  app.use(`/api/${env.API_VERSION}`, rateLimiter);
  app.use(`/api/${env.API_VERSION}/auth`, authRateLimiter);
  app.use(`/api/${env.API_VERSION}/auth/forgot-password`, passwordResetLimiter);
  app.use(`/api/${env.API_VERSION}/auth/reset-password`, passwordResetLimiter);

  // Routes
  app.use(`/api/${env.API_VERSION}`, router);

  // Health check — minimal info to avoid leaking server state
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
