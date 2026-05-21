import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { env } from './env';

// ── In-memory fallback ────────────────────────────────────────────────────────

interface MemEntry { value: string; expiresAt: number | null; }

class MemoryStore {
  private store = new Map<string, MemEntry>();

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string, ttlSeconds?: number): void {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  del(key: string): void { this.store.delete(key); }

  exists(key: string): boolean { return this.get(key) !== null; }

  incr(key: string): number {
    const current = parseInt(this.get(key) ?? '0', 10);
    const next = current + 1;
    const entry = this.store.get(key);
    this.store.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
    return next;
  }

  expire(key: string, ttlSeconds: number): void {
    const entry = this.store.get(key);
    if (entry) this.store.set(key, { ...entry, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  keys(pattern: string): string[] {
    // Convert Redis glob pattern (prefix:*) to regex
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    const now = Date.now();
    return [...this.store.entries()]
      .filter(([k, v]) => regex.test(k) && (v.expiresAt === null || now <= v.expiresAt))
      .map(([k]) => k);
  }
}

const memoryStore = new MemoryStore();

// ── Redis client ──────────────────────────────────────────────────────────────

let redisClient: RedisClientType | null = null;
let redisAvailable = false;

export const connectRedis = async (): Promise<void> => {
  try {
    const client = createClient({
      url: env.REDIS_URL,
      ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries >= 3) return false; // stop retrying on startup
          return Math.min(retries * 200, 1000);
        },
      },
    }) as RedisClientType;

    client.on('error', (err) => {
      if (redisAvailable) logger.warn({ err }, 'Redis error — using memory fallback');
      redisAvailable = false;
    });
    client.on('connect', () => {
      redisAvailable = true;
      logger.info('✅ Redis connected');
    });
    client.on('reconnecting', () => logger.warn('Redis reconnecting…'));

    await client.connect();
    redisClient = client;
    redisAvailable = true;
  } catch (err) {
    logger.warn({ err }, '⚠️  Redis unavailable — falling back to in-memory cache (rate limits & sessions will not persist across restarts)');
    redisAvailable = false;
  }
};

export const isRedisAvailable = (): boolean => redisAvailable;

export const getRedis = (): RedisClientType => {
  if (!redisClient || !redisAvailable) throw new Error('Redis not connected');
  return redisClient;
};

// ── Unified cache (Redis when available, memory otherwise) ───────────────────

export class RedisCache {
  private readonly prefix: string;
  private readonly ttl: number;

  constructor(prefix: string, ttl = env.REDIS_TTL) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  private key(id: string): string { return `${this.prefix}:${id}`; }

  async get<T>(id: string): Promise<T | null> {
    const k = this.key(id);
    if (redisAvailable && redisClient) {
      const data = await redisClient.get(k);
      return data ? (JSON.parse(data) as T) : null;
    }
    const data = memoryStore.get(k);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(id: string, value: T, ttl?: number): Promise<void> {
    const k = this.key(id);
    const t = ttl ?? this.ttl;
    if (redisAvailable && redisClient) {
      await redisClient.setEx(k, t, JSON.stringify(value));
      return;
    }
    memoryStore.set(k, JSON.stringify(value), t);
  }

  async del(id: string): Promise<void> {
    const k = this.key(id);
    if (redisAvailable && redisClient) { await redisClient.del(k); return; }
    memoryStore.del(k);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const p = `${this.prefix}:${pattern}*`;
    if (redisAvailable && redisClient) {
      const keys = await redisClient.keys(p);
      if (keys.length) await redisClient.del(keys);
      return;
    }
    memoryStore.keys(p).forEach(k => memoryStore.del(k));
  }

  async exists(id: string): Promise<boolean> {
    const k = this.key(id);
    if (redisAvailable && redisClient) {
      return (await redisClient.exists(k)) === 1;
    }
    return memoryStore.exists(k);
  }

  async increment(id: string, ttl?: number): Promise<number> {
    const k = this.key(id);
    if (redisAvailable && redisClient) {
      const count = await redisClient.incr(k);
      if (count === 1 && ttl) await redisClient.expire(k, ttl);
      return count;
    }
    const count = memoryStore.incr(k);
    if (count === 1 && ttl) memoryStore.expire(k, ttl);
    return count;
  }
}
