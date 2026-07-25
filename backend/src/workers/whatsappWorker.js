import { Worker } from "bullmq";
import { redisConnectionOptions } from "../config/redis.js";
import whatsappManager from "../services/whatsappService.js";
import prisma from "../config/db.js";
import { logger, maskPhone } from "../utils/logger.js";

export function createWhatsAppWorker() {
  if (process.env.NODE_ENV === "test") {
    return { close: async () => {} };
  }

  const worker = new Worker(
    "whatsappQueue",
    async (job) => {
      const { name, data } = job;
      const { businessId, phone, clientPhone, message, appointmentId } = data;
      const targetPhone = phone || clientPhone;

      logger.info(`[WhatsAppWorker] Processing job #${job.id} (${name}) for business ${businessId}`);

      try {
        await whatsappManager.initClient(businessId);
        await whatsappManager.waitForReady(businessId, 45000);

        await whatsappManager.sendMessage(businessId, targetPhone, message);
        logger.info(`[WhatsAppWorker] Job #${job.id} message delivered to ${maskPhone(targetPhone)}`);

        if (appointmentId && name === "SENTINEL_REMINDER") {
          await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "SENT" },
          });
        }
      } catch (err) {
        logger.error(`[WhatsAppWorker] Job #${job.id} failed:`, err.message);

        if (appointmentId && name === "SENTINEL_REMINDER" && job.attemptsMade >= (job.opts.attempts || 3)) {
          await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "ERROR" },
          }).catch(() => {});
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

  return worker;
}
