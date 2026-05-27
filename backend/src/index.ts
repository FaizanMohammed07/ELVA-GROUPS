import 'express-async-errors';
import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { connectRedis } from './config/cache';
import { seedMaterialTemplates } from './modules/material-templates/material-template.routes';
import { seedIntelligenceData } from './modules/intelligence/seed/intelligence.seed';
import { ensureAdminAccounts } from './database/seeds/super-admin';
import { logger } from './utils/logger';
import { env } from './config/env';

const bootstrap = async () => {
  try {
    await connectDatabase();
    await connectRedis(); // non-fatal — falls back to in-memory cache if Redis is down
    await ensureAdminAccounts(); // idempotent — creates admin/super-admin if not yet in DB
    await seedMaterialTemplates();
    await seedIntelligenceData();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 ELVA API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📍 Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — graceful shutdown initiated`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled Rejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught Exception');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap application');
    process.exit(1);
  }
};

bootstrap();
