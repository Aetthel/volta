import { Redis } from "ioredis";
import { logger } from "../utils/logger.js";
import fs from "fs";

const isDocker = fs.existsSync("/.dockerenv");
const IS_TEST = process.env.NODE_ENV === "test";

const baseOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  offlineQueue: false,
  retryStrategy(times) {
    if (IS_TEST) return null;
    return Math.min(times * 100, 3000);
  },
};

const getRedisConnectionOptions = () => {
  if (process.env.REDIS_TLS === "true") {
    baseOptions.tls = { rejectUnauthorized: false };
  }
  if (!process.env.REDIS_URL) {
    baseOptions.host = process.env.REDIS_HOST || (isDocker ? "redis" : "localhost");
    baseOptions.port = parseInt(process.env.REDIS_PORT || "6379", 10);
    if (process.env.REDIS_PASSWORD) baseOptions.password = process.env.REDIS_PASSWORD;
    if (process.env.REDIS_USERNAME) baseOptions.username = process.env.REDIS_USERNAME;
  }
  return baseOptions;
};

export const redisConnectionOptions = getRedisConnectionOptions();

let redisClient = null;

if (!IS_TEST) {
  try {
    if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL, redisConnectionOptions);
    } else {
      redisClient = new Redis(redisConnectionOptions);
    }

    const hostLog = process.env.REDIS_URL
      ? process.env.REDIS_URL.replace(/:[^:@]+@/, ":***@")
      : `${redisConnectionOptions.host}:${redisConnectionOptions.port}`;

    redisClient.on("connect", () => {
      logger.info(`[Redis] Connected to Redis server at ${hostLog}`);
    });

    redisClient.on("error", (err) => {
      logger.warn(`[Redis] Connection error: ${err.message}`);
    });
  } catch (err) {
    logger.error("[Redis] Initialization failed:", err);
  }
}

export default redisClient;
