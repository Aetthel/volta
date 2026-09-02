import { Worker, type Job } from "bullmq";
import { redisConnectionOptions } from "../config/redis.js";
import whatsappManager from "../services/whatsappService.js";
import prisma from "../config/db.js";
import { logger, maskPhone } from "../utils/logger.js";
import type { WhatsAppJobPayload, WhatsAppJobType } from "../queues/whatsappQueue.js";

export function createWhatsAppWorker(): Worker<WhatsAppJobPayload, any, WhatsAppJobType> | { close: () => Promise<void> } | null {
  if (process.env.NODE_ENV === "test") {
    return { close: async () => {} };
  }

  try {
    const worker = new Worker<WhatsAppJobPayload, any, WhatsAppJobType>(
      "whatsappQueue",
      async (job: Job<WhatsAppJobPayload, any, WhatsAppJobType>) => {
        const { name, data } = job;
        const { businessId, phone, clientPhone, message, appointmentId } = data;
        const targetPhone = phone || clientPhone;

        if (!targetPhone || !message) {
          logger.warn(`[WhatsAppWorker] Missing phone or message for job #${job.id}`);
          return;
        }

        logger.info(
          `[WhatsAppWorker] Processing job #${job.id} (${name}) for business ${businessId}`
        );

        try {
          await whatsappManager.initClient(businessId);
          await whatsappManager.waitForReady(businessId, 45000);

          // Human-like delay (2.5s - 5.5s) to avoid bot detection by WhatsApp algorithms
          const humanDelay = Math.floor(Math.random() * 3000) + 2500;
          await new Promise((resolve) => setTimeout(resolve, humanDelay));

          await whatsappManager.sendMessage(businessId, targetPhone, message);
          logger.info(
            `[WhatsAppWorker] Job #${job.id} message delivered to ${maskPhone(targetPhone)}`
          );

          if (appointmentId && name === "SENTINEL_REMINDER") {
            await prisma.appointment.update({
              where: { id: appointmentId },
              data: { status: "SENT" },
            });
          }
        } catch (err: any) {
          logger.error(`[WhatsAppWorker] Job #${job.id} failed:`, err.message);

          if (
            appointmentId &&
            name === "SENTINEL_REMINDER" &&
            job.attemptsMade >= (job.opts.attempts || 3)
          ) {
            await prisma.appointment
              .update({
                where: { id: appointmentId },
                data: { status: "ERROR" },
              })
              .catch(() => {});
          }

          throw err;
        }
      },
      {
        connection: redisConnectionOptions,
        concurrency: 1, // Single message at a time per worker instance
        limiter: {
          max: 1,
          duration: 3000, // Anti-spam: Max 1 message every 3 seconds
        },
      }
    );

    worker.on("completed", (job) => {
      logger.info(`[WhatsAppWorker] Job #${job.id} completed successfully.`);
    });

    worker.on("failed", (job, err) => {
      logger.error(`[WhatsAppWorker] Job #${job?.id} failed with error:`, err.message);
    });

    logger.info("[WhatsAppWorker] Worker started successfully.");
    return worker;
  } catch (err: any) {
    logger.error("[WhatsAppWorker] Failed to start worker:", err.message);
    return null;
  }
}

export default { createWhatsAppWorker };
