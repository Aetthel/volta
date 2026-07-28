import prisma from "../config/db.js";
import { sendConsentMessage } from "./botService.js";
import whatsappManager from "./whatsappService.js";
import { maskPhone } from "../utils/logger.js";
import { logger } from "../utils/logger.js";

export const getClientsByBusiness = async (businessId) => {
  return await prisma.client.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
};

export const createClient = async (clientData) => {
  const { name, surname, email, phone, businessId } = clientData;

  const client = await prisma.client.create({
    data: {
      name,
      surname: surname || "",
      email,
      phone,
      lopdStatus: "Pendiente",
      businessId,
    },
  });

  sendConsentMessage(businessId, client).catch((err) => {
    logger.error("[Clients Service] Error sending LOPD consent request:", err);
  });

  return client;
};

export const updateClient = async (id, clientData) => {
  const { name, surname, email, phone, lastVisit, frequentService } = clientData;

  let parsedLastVisit = undefined;
  if (lastVisit !== undefined) {
    if (!lastVisit) {
      parsedLastVisit = null;
    } else if (lastVisit instanceof Date) {
      parsedLastVisit = lastVisit;
    } else {
      const d = new Date(lastVisit);
      parsedLastVisit = isNaN(d.getTime()) ? null : d;
    }
  }

  return await prisma.client.update({
    where: { id },
    data: {
      name,
      surname,
      email,
      phone,
      ...(parsedLastVisit !== undefined && { lastVisit: parsedLastVisit }),
      frequentService,
    },
  });
};

export const deleteClient = async (id) => {
  await prisma.appointment.updateMany({
    where: { clientId: id },
    data: { clientId: null },
  });

  return await prisma.client.delete({
    where: { id },
  });
};

export const getClientById = async (id) => {
  return await prisma.client.findUnique({
    where: { id },
  });
};

export const resendConsent = async (client) => {
  sendConsentMessage(client.businessId, client).catch((err) => {
    logger.error("[Clients Service] Error resending LOPD consent request:", err);
  });
};

export const sendMessage = async (client, message) => {
  await whatsappManager.sendMessage(client.businessId, client.phone, message.trim());
  logger.info(`[WhatsApp] Custom message sent to ${maskPhone(client.phone)}`);
};
