import 'express-async-errors';
import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { env } from './config/env';

const bootstrap = async () => {
  try {
    await connectDatabase();
    await connectRedis();

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
      logger.error('Unhandled Rejection', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to bootstrap application', { error });
    process.exit(1);
  }
};

bootstrap();
