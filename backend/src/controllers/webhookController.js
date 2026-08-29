import prisma from "../config/db.js";
import { logger } from "../utils/logger.js";
import intentClassifier, { INTENT_TAGS } from "../services/intentClassifier.js";

/**
 * Parses business ID from Evolution API instance name (e.g. biz_UUID)
 */
function parseBusinessId(instanceName) {
  if (!instanceName) return null;
  if (instanceName.startsWith("biz_")) {
    return instanceName.slice(4);
  }
  return instanceName;
}

/**
 * Extracts plain text from WhatsApp message object
 */
function extractMessageText(messageObj) {
  if (!messageObj) return "";
  if (typeof messageObj === "string") return messageObj;
  return (
    messageObj.conversation ||
    messageObj.extendedTextMessage?.text ||
    messageObj.imageMessage?.caption ||
    messageObj.videoMessage?.caption ||
    ""
  );
}

/**
 * Controller to handle incoming Evolution API Webhooks
 */
export async function handleWhatsAppWebhook(req, res) {
  const payload = req.body;
  const rawEvent = payload?.event || req.params?.event || req.params?.[0] || "";
  const event = rawEvent.toLowerCase().replace(/[_-]/g, ".");
  const instance = payload?.instance || "";
  const data = payload?.data || payload;

  if (!instance) {
    return res.status(200).json({ status: "ignored", reason: "missing instance" });
  }

  const businessId = parseBusinessId(instance);
  logger.info(`[WhatsApp Webhook] Received event: ${event || rawEvent} for business: ${businessId}`);

  try {
    // 1. Connection Update Event
    if (event.includes("connection.update")) {
      const state = data?.state;
      logger.info(`[WhatsApp Webhook] Connection state for ${businessId}: ${state}`);

      if (state === "open") {
        await prisma.business.updateMany({
          where: { id: businessId },
          data: { whatsappStatus: "CONNECTED", qrCode: null },
        });
      } else if (state === "close") {
        await prisma.business.updateMany({
          where: { id: businessId },
          data: { whatsappStatus: "DISCONNECTED" },
        });
      } else if (state === "connecting") {
        await prisma.business.updateMany({
          where: { id: businessId },
          data: { whatsappStatus: "WAITING_QR" },
        });
      }
    }

    // 2. QR Code Updated Event
    if (event.includes("qrcode.updated")) {
      const qrBase64 = data?.qrcode?.base64 || data?.base64 || data?.qrcode?.code || null;
      if (qrBase64) {
        logger.info(`[WhatsApp Webhook] New QR code received for ${businessId}`);
        await prisma.business.updateMany({
          where: { id: businessId },
          data: { whatsappStatus: "WAITING_QR", qrCode: qrBase64 },
        });
      }
    }

    // 3. Messages Upsert Event (Incoming customer message)
    if (event === "messages.upsert") {
      const messageData = data?.message || data;
      const key = data?.key || messageData?.key;
      const fromMe = key?.fromMe || false;

      // Ignore messages sent by ourselves
      if (fromMe) {
        return res.status(200).json({ status: "ignored", reason: "fromMe is true" });
      }

      const remoteJid = key?.remoteJid || "";
      const rawPhone = remoteJid.replace(/@.*$/, "").replace(/\D/g, "");
      const phoneSuffix = rawPhone.slice(-9);
      const text = extractMessageText(data?.message?.message || messageData?.message || data?.message);

      if (text && phoneSuffix) {
        logger.info(`[WhatsApp Webhook] Incoming message from ${rawPhone}: "${text}"`);

        // Classify the customer's intent
        const classification = await intentClassifier.classify(text);
        const { tag, source } = classification;

        // Find associated appointment for this business and phone
        const appointment = await prisma.appointment.findFirst({
          where: {
            businessId,
            clientPhone: { contains: phoneSuffix },
          },
          orderBy: { appointmentDate: "desc" },
          include: { business: { include: { users: true } } },
        });

        const clientName = appointment?.clientName || "Cliente WhatsApp";

        // Create alert for business admin / owners
        let targetUserId = appointment?.business?.users?.[0]?.id;
        if (!targetUserId && businessId) {
          const bizUser = await prisma.user.findFirst({
            where: { businessId },
            select: { id: true },
          });
          targetUserId = bizUser?.id;
        }

        if (tag === INTENT_TAGS.CONFIRMADO) {
          logger.info(`[WhatsApp Webhook] Appointment confirmed by ${clientName} (${rawPhone})`);
          if (appointment) {
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: { attended: true },
            });
          }
          if (targetUserId) {
            await prisma.alert.create({
              data: {
                userId: targetUserId,
                type: "NOTIFICACION",
                title: `Cita Confirmada: ${clientName}`,
                description: `El cliente ha confirmado su cita respondiendo "${text}"`,
              },
            });
          }
        } else if (tag === INTENT_TAGS.CANCELADO) {
          logger.info(`[WhatsApp Webhook] Appointment cancelled by ${clientName} (${rawPhone})`);
          if (appointment) {
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: { attended: false },
            });
          }
          if (targetUserId) {
            await prisma.alert.create({
              data: {
                userId: targetUserId,
                type: "AVISO",
                title: `Cita Cancelada: ${clientName}`,
                description: `El cliente ha indicado que no asistirá: "${text}"`,
              },
            });
          }
        } else if (tag === INTENT_TAGS.SOLICITA_CAMBIO) {
          logger.info(`[WhatsApp Webhook] Reschedule requested by ${clientName} (${rawPhone})`);
          if (targetUserId) {
            await prisma.alert.create({
              data: {
                userId: targetUserId,
                type: "EMERGENTE",
                title: `Solicitud de Cambio de Cita: ${clientName}`,
                description: `El cliente solicita cambiar la cita: "${text}"`,
              },
            });
          }
        } else {
          // REQUIERE_HUMANO
          logger.info(`[WhatsApp Webhook] Question from ${clientName} (${rawPhone}) requiring human response`);
          if (targetUserId) {
            await prisma.alert.create({
              data: {
                userId: targetUserId,
                type: "AVISO",
                title: `Mensaje de ${clientName}`,
                description: `Mensaje recibido: "${text}"`,
              },
            });
          }
        }
      }
    }

    return res.status(200).json({ status: "success", event, businessId });
  } catch (err) {
    logger.error("[WhatsApp Webhook] Error processing webhook payload:", err);
    return res.status(200).json({ status: "error", message: err.message });
  }
}
