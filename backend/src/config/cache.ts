/**
 * MongoDB-backed cache — drop-in replacement for Redis.
 * Uses a TTL index so MongoDB auto-expires entries; no extra infra needed.
 * All exports keep the same names so nothing else in the codebase changes.
 */
import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Mongoose model ────────────────────────────────────────────────────────────

interface ICacheEntry extends Document {
  key: string;
  value: string;
  expiresAt?: Date;
}

const CacheEntrySchema = new Schema<ICacheEntry>(
  {
    key:       { type: String, required: true, unique: true },
    value:     { type: String, required: true },
    expiresAt: { type: Date },
  },
  { collection: 'cache_entries', versionKey: false },
);

// MongoDB auto-deletes documents when the current time passes `expiresAt`
CacheEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CacheModel: Model<ICacheEntry> =
  (mongoose.models['CacheEntry'] as Model<ICacheEntry>) ||
  mongoose.model<ICacheEntry>('CacheEntry', CacheEntrySchema);

// ── Public API (matches the old RedisCache interface exactly) ─────────────────

/** No-op — MongoDB is already connected by connectDatabase() in index.ts */
export const connectRedis = async (): Promise<void> => {};

/** Always true — MongoDB is the backing store and is always available */
export const isRedisAvailable = (): boolean => true;

export class RedisCache {
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(prefix: string, ttl = 3600) {
    this.prefix = prefix;
    this.defaultTtl = ttl;
  }

  private key(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async get<T>(id: string): Promise<T | null> {
    try {
      const doc = await CacheModel.findOne({ key: this.key(id) }).lean<ICacheEntry>();
      if (!doc) return null;
      // Double-check expiry in case TTL background job hasn't run yet
      if (doc.expiresAt && doc.expiresAt < new Date()) {
        await CacheModel.deleteOne({ key: this.key(id) });
        return null;
      }
      return JSON.parse(doc.value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(id: string, value: T, ttl?: number): Promise<void> {
    const t = ttl ?? this.defaultTtl;
    const expiresAt = t > 0 ? new Date(Date.now() + t * 1_000) : undefined;
    try {
      await CacheModel.findOneAndUpdate(
        { key: this.key(id) },
        { value: JSON.stringify(value), expiresAt },
        { upsert: true, new: true },
      );
    } catch { /* non-critical — best effort */ }
  }

  async del(id: string): Promise<void> {
    try {
      await CacheModel.deleteOne({ key: this.key(id) });
    } catch { /* non-critical */ }
  }

  /** Deletes all entries whose key starts with `prefix:pattern` */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const escaped = this.key(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await CacheModel.deleteMany({ key: new RegExp(`^${escaped}`) });
    } catch { /* non-critical */ }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const doc = await CacheModel.findOne({ key: this.key(id) }, { expiresAt: 1 }).lean<ICacheEntry>();
      if (!doc) return false;
      if (doc.expiresAt && doc.expiresAt < new Date()) {
        await CacheModel.deleteOne({ key: this.key(id) });
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async increment(id: string, ttl?: number): Promise<number> {
    const current = await this.get<number>(id) ?? 0;
    const next = current + 1;
    await this.set(id, next, ttl);
    return next;
  }
}
