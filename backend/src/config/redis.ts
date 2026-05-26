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
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    const now = Date.now();
    return [...this.store.entries()]
      .filter(([k, v]) => regex.test(k) && (v.expiresAt === null || now <= v.expiresAt))
      .map(([k]) => k);
  }
}

const memoryStore = new MemoryStore();

// ── Mock Redis connection ───────────────────────────────────────────────────────

export const connectRedis = async (): Promise<void> => {
  // no-op, now fully in-memory
};

export const isRedisAvailable = (): boolean => false;

// ── Unified cache (memory only now) ───────────────────────────────────────────

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
    const data = memoryStore.get(k);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(id: string, value: T, ttl?: number): Promise<void> {
    const k = this.key(id);
    const t = ttl ?? this.ttl;
    memoryStore.set(k, JSON.stringify(value), t);
  }

  async del(id: string): Promise<void> {
    const k = this.key(id);
    memoryStore.del(k);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const p = `${this.prefix}:${pattern}*`;
    memoryStore.keys(p).forEach(k => memoryStore.del(k));
  }

  async exists(id: string): Promise<boolean> {
    const k = this.key(id);
    return memoryStore.exists(k);
  }

  async increment(id: string, ttl?: number): Promise<number> {
    const k = this.key(id);
    const count = memoryStore.incr(k);
    if (count === 1 && ttl) memoryStore.expire(k, ttl);
    return count;
  }
}
