import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis.js";
import { logger } from "../utils/logger.js";

let whatsappQueue = null;

if (process.env.NODE_ENV !== "test") {
  try {
    whatsappQueue = new Queue("whatsappQueue", {
      connection: redisConnectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000, // 5s initial delay
        },
        removeOnComplete: {
          age: 86400, // 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 604800, // 7 days
        },
      },
    });

    logger.info("[BullMQ] Initialized whatsappQueue successfully.");
  } catch (err) {
    logger.warn(`[BullMQ] Could not initialize whatsappQueue: ${err.message}`);
  }
}

/**
 * Enqueues a WhatsApp message job for background processing.
 *
 * @param {string} jobType - "SENTINEL_REMINDER" | "WELCOME_MESSAGE" | "LOPD_CONSENT"
 * @param {object} payload - Job payload
 * @returns {Promise<object|null>} The created job instance
 */
export async function enqueueWhatsAppMessage(jobType, payload) {
  if (process.env.NODE_ENV === "test" || !whatsappQueue) {
    logger.warn("[BullMQ] whatsappQueue not initialized, skipping enqueue.");
    return null;
  }

  try {
    const job = await whatsappQueue.add(jobType, payload, {
      jobId: payload.appointmentId
        ? `${jobType}-${payload.appointmentId}`
        : `${jobType}-${payload.clientId}-${Date.now()}`,
    });

    logger.info(`[BullMQ] Enqueued ${jobType} job #${job.id}`);
    return job;
  } catch (err) {
    logger.error(`[BullMQ] Failed to enqueue ${jobType} job:`, err.message);
    return null;
  }
}

export { whatsappQueue };
