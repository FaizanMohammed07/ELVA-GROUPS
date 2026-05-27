import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export const connectDatabase = async (): Promise<void> => {
  const options: mongoose.ConnectOptions = {
    dbName: env.MONGODB_DB_NAME,
    maxPoolSize: env.NODE_ENV === 'production' ? 50 : 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
  };

  mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, options);
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        logger.error({ err, attempt }, 'MongoDB connection failed after all retries');
        throw err;
      }
      const delay = RETRY_DELAY_MS * attempt;
      logger.warn({ attempt, delay, err }, `MongoDB connection attempt ${attempt} failed — retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};
