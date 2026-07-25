import { Redis } from "ioredis";
import config from "./index.js";
import { logger } from "../utils/logger.js";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const IS_TEST = process.env.NODE_ENV === "test";

export const redisConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  offlineQueue: false,
  retryStrategy() {
    // Return null to prevent continuous reconnect loops when Redis is offline
    return null;
  },
};

let redisClient = null;

if (!IS_TEST) {
  try {
    redisClient = new Redis(redisConnectionOptions);

    redisClient.on("connect", () => {
      logger.info(`[Redis] Connected to Redis server at ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redisClient.on("error", (err) => {
      logger.warn(`[Redis] Connection error: ${err.message}`);
    });
  } catch (err) {
    logger.error("[Redis] Initialization failed:", err);
  }
}

export default redisClient;
