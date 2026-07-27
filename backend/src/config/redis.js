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
  const options = { ...baseOptions };

  if (process.env.REDIS_TLS === "true") {
    options.tls = { rejectUnauthorized: false };
  }

  if (process.env.REDIS_URL) {
    try {
      const parsedUrl = new URL(process.env.REDIS_URL);
      options.host = parsedUrl.hostname;
      options.port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379;
      if (parsedUrl.username) options.username = decodeURIComponent(parsedUrl.username);
      if (parsedUrl.password) options.password = decodeURIComponent(parsedUrl.password);
      if (parsedUrl.protocol === "rediss:") {
        options.tls = options.tls || { rejectUnauthorized: false };
      }
      if (parsedUrl.pathname && parsedUrl.pathname.length > 1) {
        const dbIndex = parseInt(parsedUrl.pathname.substring(1), 10);
        if (!isNaN(dbIndex)) options.db = dbIndex;
      }
    } catch (err) {
      logger.warn(
        `[Redis] Could not parse REDIS_URL (${err.message}), falling back to direct options.`
      );
    }
  } else {
    options.host = process.env.REDIS_HOST || (isDocker ? "redis" : "localhost");
    options.port = parseInt(process.env.REDIS_PORT || "6379", 10);
    if (process.env.REDIS_PASSWORD) options.password = process.env.REDIS_PASSWORD;
    if (process.env.REDIS_USERNAME) options.username = process.env.REDIS_USERNAME;
  }

  return options;
};

export const redisConnectionOptions = getRedisConnectionOptions();

let redisClient = null;

if (!IS_TEST) {
  try {
    redisClient = new Redis(redisConnectionOptions);

    const hostLog = `${redisConnectionOptions.host}:${redisConnectionOptions.port}`;

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
