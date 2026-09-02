import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

/**
 * Cache service providing Redis-backed in-memory caching with graceful fallbacks
 */
class CacheService {
  public client: any;
  public defaultTTL: number;

  constructor() {
    this.client = redisClient;
    this.defaultTTL = 300; // 5 minutes in seconds
  }

  isReady(): boolean {
    return Boolean(this.client && this.client.status === "ready");
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      logger.warn(`[CacheService] Error reading key "${key}": ${err.message}`);
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds = this.defaultTTL): Promise<boolean> {
    if (!this.client) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, serialized, "EX", ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (err: any) {
      logger.warn(`[CacheService] Error writing key "${key}": ${err.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (err: any) {
      logger.warn(`[CacheService] Error deleting key "${key}": ${err.message}`);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.client) return 0;
    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      let totalDeleted = 0;
      for await (const keys of stream) {
        if (keys.length > 0) {
          const deleted = await this.client.del(...keys);
          totalDeleted += deleted;
        }
      }
      return totalDeleted;
    } catch (err: any) {
      logger.warn(`[CacheService] Error invalidating pattern "${pattern}": ${err.message}`);
      return 0;
    }
  }

  static keys = {
    businessServices: (businessId: string): string => `volta:cache:biz:${businessId}:services`,
    businessProfile: (businessId: string): string => `volta:cache:biz:${businessId}:profile`,
    publicBookingSlots: (businessId: string, dateStr: string): string => `volta:cache:biz:${businessId}:slots:${dateStr}`,
    businessPattern: (businessId: string): string => `volta:cache:biz:${businessId}:*`,
  };
}

export const cacheService = new CacheService();
export default cacheService;
