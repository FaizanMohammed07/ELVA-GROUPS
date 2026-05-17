import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { env } from './env';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  redisClient = createClient({
    url: env.REDIS_URL,
    ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) return new Error('Redis connection failed after 10 retries');
        return Math.min(retries * 100, 3000);
      },
    },
  }) as RedisClientType;

  redisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
  redisClient.on('connect', () => logger.info('✅ Redis connected'));
  redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));

  await redisClient.connect();
};

export const getRedis = (): RedisClientType => {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
};

export class RedisCache {
  private readonly prefix: string;
  private readonly ttl: number;

  constructor(prefix: string, ttl = env.REDIS_TTL) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  private key(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async get<T>(id: string): Promise<T | null> {
    const data = await getRedis().get(this.key(id));
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(id: string, value: T, ttl?: number): Promise<void> {
    await getRedis().setEx(this.key(id), ttl ?? this.ttl, JSON.stringify(value));
  }

  async del(id: string): Promise<void> {
    await getRedis().del(this.key(id));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await getRedis().keys(`${this.prefix}:${pattern}*`);
    if (keys.length) await getRedis().del(keys);
  }

  async exists(id: string): Promise<boolean> {
    const result = await getRedis().exists(this.key(id));
    return result === 1;
  }

  async increment(id: string, ttl?: number): Promise<number> {
    const redis = getRedis();
    const key = this.key(id);
    const count = await redis.incr(key);
    if (count === 1 && ttl) await redis.expire(key, ttl);
    return count;
  }
}
