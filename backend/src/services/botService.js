import prisma from "../config/db.js";
import whatsappManager from "./whatsappService.js";
import config from "../config/index.js";
import { computeHmac } from "../utils/crypto.js";
import { maskPhone } from "../utils/logger.js";
import { logger } from "../utils/logger.js";
import { enqueueWhatsAppMessage } from "../queues/whatsappQueue.js";

/**
 * Formats a message template by replacing placeholders with actual data
 */
function formatMessage(template, { clientName, appointmentDate, businessName }) {
  if (!template) return null;

  const date = new Date(appointmentDate);
  const dateStr = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return template
    .replace(/{{clientName}}/g, clientName)
    .replace(/{{appointmentDate}}/g, dateStr)
    .replace(/{{appointmentTime}}/g, timeStr)
    .replace(/{{businessName}}/g, businessName);
}

/**
 * Sends an immediate welcome/booking confirmation message
 */
async function sendWelcomeMessage(appointmentId) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: true,
        client: true,
      },
    });

    if (!appt || !appt.business.welcomeMessage) return;

    if (!appt.client || appt.client.lopdStatus !== "Aceptado") {
      logger.info(
        `[Bot] Skipping welcome message to ${maskPhone(appt.clientPhone)} (LOPD: ${appt.client?.lopdStatus || "unknown"})`
      );
      return;
    }

    const message = formatMessage(appt.business.welcomeMessage, {
      clientName: appt.clientName,
      appointmentDate: appt.appointmentDate,
      businessName: appt.business.name,
    });

    // Enqueue job in Redis / BullMQ
    const job = await enqueueWhatsAppMessage("WELCOME_MESSAGE", {
      appointmentId,
      businessId: appt.businessId,
      phone: appt.clientPhone,
      message,
    });

    // Fallback if Redis Queue is not active
    if (!job) {
      logger.info(`[Bot] [Direct Fallback] Sending welcome to ${maskPhone(appt.clientPhone)}...`);
      await whatsappManager.initClient(appt.businessId);
      await whatsappManager.waitForReady(appt.businessId, 45000);
      await whatsappManager.sendMessage(appt.businessId, appt.clientPhone, message);
    }
  } catch (err) {
    logger.error(`[Bot] Error sending welcome message:`, err);
  }
}

/**
 * The Sentinel: Scans for pending appointments for the next day and sends notifications
 */
async function runSentinel() {
  logger.info(`[Sentinel] Starting daily scanning process: ${new Date().toLocaleString()}`);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "PENDING",
        appointmentDate: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
      },
      include: {
        business: true,
        client: true,
      },
    });

    logger.info(`[Sentinel] Found ${appointments.length} pending appointments for tomorrow.`);

    for (const appt of appointments) {
      try {
        if (!appt.client || appt.client.lopdStatus !== "Aceptado") {
          logger.info(
            `[Sentinel] Skipping reminder to ${maskPhone(appt.clientPhone)} (LOPD: ${appt.client?.lopdStatus || "unknown"})`
          );
          continue;
        }

        if (!appt.business.reminderMessage) {
          logger.info(`[Sentinel] No reminder template for ${appt.business.name}, skipping.`);
          continue;
        }

        // Fail fast: skip immediately if the business WhatsApp link is not connected
        if (
          appt.business.whatsappStatus === "DISCONNECTED" ||
          appt.business.whatsappStatus === "WAITING_QR"
        ) {
          logger.warn(
            `[Sentinel] Skipping reminder to ${maskPhone(appt.clientPhone)}: Business ${appt.business.name} WhatsApp status is ${appt.business.whatsappStatus}`
          );
          await prisma.appointment.update({
            where: { id: appt.id },
            data: { status: "ERROR" },
          });
          continue;
        }

        const message = formatMessage(appt.business.reminderMessage, {
          clientName: appt.clientName,
          appointmentDate: appt.appointmentDate,
          businessName: appt.business.name,
        });

        // Enqueue job to BullMQ / Redis
        const job = await enqueueWhatsAppMessage("SENTINEL_REMINDER", {
          appointmentId: appt.id,
          businessId: appt.businessId,
          phone: appt.clientPhone,
          message,
        });

        // Fallback for non-Redis local execution
        if (!job) {
          await whatsappManager.initClient(appt.businessId);
          await whatsappManager.waitForReady(appt.businessId, 45000);
          await whatsappManager.sendMessage(appt.businessId, appt.clientPhone, message);

          await prisma.appointment.update({
            where: { id: appt.id },
            data: { status: "SENT" },
          });
        }
      } catch (err) {
        logger.error(`[Sentinel] Error processing appointment ${appt.id}:`, err);
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: "ERROR" },
        });
      }
    }
  } catch (err) {
    logger.error(`[Sentinel] Fatal error:`, err);
  }
}

/**
 * Sends an automatic LOPD consent message to a client.
 */
async function sendConsentMessage(businessId, client) {
  const FRONTEND_URL = config.frontendUrl;
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const tokenData = `${client.id}:${expiry}`;
  const token = computeHmac(tokenData, config.lopdHmacSecret);
  const consentUrl = `${FRONTEND_URL}/lopd/${client.id}?token=${token}&exp=${expiry}`;
  const message = `¡Hola ${client.name}! Para cumplir con la LOPD y poder enviarte recordatorios de tus citas por WhatsApp, por favor acepta nuestra política de privacidad aquí: ${consentUrl}`;

  logger.info(`[Bot] Triggering LOPD consent for client ${client.id}`);

  try {
    const job = await enqueueWhatsAppMessage("LOPD_CONSENT", {
      clientId: client.id,
      businessId,
      phone: client.phone,
      message,
    });

    if (!job) {
      await whatsappManager.initClient(businessId);
      await whatsappManager.waitForReady(businessId, 45000);
      await whatsappManager.sendMessage(businessId, client.phone, message);
      logger.info(`[WhatsApp] [Direct Fallback] LOPD consent message sent to ${maskPhone(client.phone)}`);
    }
  } catch (wsErr) {
    logger.error(`[WhatsApp] Failed to send LOPD consent message:`, wsErr.message);
  }
}

export { runSentinel, sendWelcomeMessage, sendConsentMessage };
