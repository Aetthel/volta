import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

/**
 * Cache service providing Redis-backed in-memory caching with graceful fallbacks
 */
class CacheService {
  constructor() {
    this.client = redisClient;
    this.defaultTTL = 300; // 5 minutes in seconds
  }

  /**
   * Check if redis client is connected and ready
   */
  isReady() {
    return this.client && this.client.status === "ready";
  }

  /**
   * Get cached item by key
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      logger.warn(`[CacheService] Error reading key "${key}": ${err.message}`);
      return null;
    }
  }

  /**
   * Set cached item with TTL in seconds
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds]
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    if (!this.client) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, serialized, "EX", ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (err) {
      logger.warn(`[CacheService] Error writing key "${key}": ${err.message}`);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      logger.warn(`[CacheService] Error deleting key "${key}": ${err.message}`);
      return false;
    }
  }

  /**
   * Invalidate all keys matching a wildcard pattern (e.g. "volta:cache:biz:123:*")
   * @param {string} pattern
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidatePattern(pattern) {
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
    } catch (err) {
      logger.warn(`[CacheService] Error invalidating pattern "${pattern}": ${err.message}`);
      return 0;
    }
  }

  /**
   * Helper to generate standardized cache keys
   */
  static keys = {
    businessServices: (businessId) => `volta:cache:biz:${businessId}:services`,
    businessProfile: (businessId) => `volta:cache:biz:${businessId}:profile`,
    publicBookingSlots: (businessId, dateStr) => `volta:cache:biz:${businessId}:slots:${dateStr}`,
    businessPattern: (businessId) => `volta:cache:biz:${businessId}:*`,
  };
}

export const cacheService = new CacheService();
export default cacheService;
