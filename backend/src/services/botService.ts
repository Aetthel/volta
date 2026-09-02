import prisma from "../config/db.js";
import whatsappManager from "./whatsappService.js";
// @ts-ignore - config is an existing JS module
import config from "../config/index.js";
import { computeHmac } from "../utils/crypto.js";
import { maskPhone, logger } from "../utils/logger.js";
// @ts-ignore - whatsappQueue is an existing JS module
import { enqueueWhatsAppMessage } from "../queues/whatsappQueue.js";

export interface FormatMessageData {
  clientName?: string | null;
  appointmentDate?: Date | string | null;
  businessName?: string | null;
  serviceName?: string | null;
  lopdUrl?: string | null;
}

/**
 * Formats a message template by replacing placeholders with actual data
 */
export function formatMessage(template: string | null | undefined, data: FormatMessageData): string | null {
  if (!template) return null;

  const rawName = data.clientName ? data.clientName.trim() : "";
  const firstName = rawName ? rawName.split(/\s+/)[0] : "";

  let dateStr = "";
  let timeStr = "";

  if (data.appointmentDate) {
    const date = new Date(data.appointmentDate);
    dateStr = date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  return template
    .replace(/\{nombre\}/gi, firstName)
    .replace(/\{nombre_completo\}/gi, rawName)
    .replace(/\{link_lopd\}/gi, data.lopdUrl || "")
    .replace(/\{fecha\}/gi, dateStr)
    .replace(/\{hora\}/gi, timeStr)
    .replace(/\{servicio\}/gi, data.serviceName || "")
    .replace(/\{negocio\}/gi, data.businessName || "")
    .replace(/\{\{clientName\}\}/gi, firstName)
    .replace(/\{\{clientFullName\}\}/gi, rawName)
    .replace(/\{\{lopdUrl\}\}/gi, data.lopdUrl || "")
    .replace(/\{\{appointmentDate\}\}/gi, dateStr)
    .replace(/\{\{appointmentTime\}\}/gi, timeStr)
    .replace(/\{\{serviceName\}\}/gi, data.serviceName || "")
    .replace(/\{\{businessName\}\}/gi, data.businessName || "");
}

/**
 * Sends an immediate welcome/booking confirmation message
 */
export async function sendWelcomeMessage(appointmentId: string): Promise<void> {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: true,
        client: true,
        service: true,
      },
    });

    if (!appt) return;

    if (!appt.client || appt.client.lopdStatus !== "Aceptado") {
      logger.info(
        `[Bot] Skipping welcome message to ${maskPhone(appt.clientPhone)} (LOPD: ${appt.client?.lopdStatus || "unknown"})`
      );
      return;
    }

    const template =
      appt.business.welcomeMessage ||
      `Hola {nombre}, tu cita para {servicio} en {negocio} ha sido confirmada para el {fecha} a las {hora}.`;

    const message = formatMessage(template, {
      clientName: appt.clientName,
      appointmentDate: appt.appointmentDate,
      businessName: appt.business.name,
      serviceName: appt.service?.name || "tu servicio",
    });

    if (!message) return;

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
 * The Sentinel: Scans for pending appointments in the upcoming 24 hours and sends notifications
 */
export async function runSentinel(): Promise<void> {
  logger.info(`[Sentinel] Scanning upcoming appointments: ${new Date().toLocaleString()}`);

  const now = new Date();
  const windowStart = now;
  const windowEnd = new Date(now.getTime() + (24 * 60 + 15) * 60 * 1000);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "PENDING",
        appointmentDate: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        business: true,
        client: true,
        service: true,
      },
    });

    logger.info(`[Sentinel] Found ${appointments.length} pending appointment(s) in the 24h window.`);

    for (const appt of appointments) {
      try {
        if (!appt.client || appt.client.lopdStatus !== "Aceptado") {
          logger.info(
            `[Sentinel] Skipping reminder to ${maskPhone(appt.clientPhone)} (LOPD: ${appt.client?.lopdStatus || "unknown"})`
          );
          continue;
        }

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

        const template =
          appt.business.reminderMessage ||
          `Hola {nombre}, te recordamos tu cita de {servicio} para mañana a las {hora}. ¡Te esperamos en {negocio}!`;

        const message = formatMessage(template, {
          clientName: appt.clientName,
          appointmentDate: appt.appointmentDate,
          businessName: appt.business.name,
          serviceName: appt.service?.name || "tu servicio",
        });

        if (!message) continue;

        const job = await enqueueWhatsAppMessage("SENTINEL_REMINDER", {
          appointmentId: appt.id,
          businessId: appt.businessId,
          phone: appt.clientPhone,
          message,
        });

        if (!job) {
          const humanDelay = Math.floor(Math.random() * 3000) + 3000;
          await new Promise((resolve) => setTimeout(resolve, humanDelay));

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
export async function sendConsentMessage(
  businessId: string,
  client: { id: string; name?: string | null; phone: string }
): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, welcomeMessage: true },
  });

  const businessName = business?.name || "Martí's Peluquería";
  const baseUrl = (config.frontendUrl || "http://localhost:3000").replace(/\/+$/, "");
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const tokenData = `${client.id}:${expiry}`;
  const token = computeHmac(tokenData, config.lopdHmacSecret);
  const consentUrl = `${baseUrl}/lopd/${client.id}?token=${token}&exp=${expiry}`;

  const template =
    business?.welcomeMessage ||
    `Hola {nombre}, bienvenido/a a {negocio}. Por favor confirma la política de privacidad en: {link_lopd}`;

  const message = formatMessage(template, {
    clientName: client.name,
    businessName,
    lopdUrl: consentUrl,
  });

  if (!message) return;

  logger.info(`[Bot] Triggering LOPD consent for client ${client.id} with message: "${message}"`);

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
      logger.info(
        `[WhatsApp] [Direct Fallback] LOPD consent message sent to ${maskPhone(client.phone)}`
      );
    }
  } catch (wsErr: any) {
    logger.error(`[WhatsApp] Failed to send LOPD consent message:`, wsErr.message);
  }
}

export default {
  runSentinel,
  sendWelcomeMessage,
  sendConsentMessage,
  formatMessage,
};
