import prisma from "../config/db.js";
// @ts-ignore - botService is an existing JS module
import { sendConsentMessage } from "./botService.js";
// @ts-ignore - whatsappService is an existing JS module
import whatsappManager from "./whatsappService.js";
import { maskPhone, logger } from "../utils/logger.js";
import { normalizePhone } from "../utils/index.js";
import type { CreateClientInput, UpdateClientInput } from "../validators/index.js";

export const getClientsByBusiness = async (businessId: string) => {
  return prisma.client.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
};

export const createClient = async (clientData: CreateClientInput) => {
  const { name, surname, email, phone, businessId } = clientData;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    const error = new Error("El negocio especificado no existe o ha sido eliminado.") as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const client = await prisma.client.create({
    data: {
      name,
      surname: surname || "",
      email: email || null,
      phone: normalizePhone(phone) || phone,
      lopdStatus: "Pendiente",
      businessId,
    },
  });

  sendConsentMessage(businessId, client).catch((err: unknown) => {
    logger.error("[Clients Service] Error sending LOPD consent request:", err);
  });

  return client;
};

export const updateClient = async (id: string, clientData: UpdateClientInput) => {
  const { name, surname, email, phone, lastVisit, frequentService } = clientData;

  let parsedLastVisit: Date | null | undefined = undefined;
  if (lastVisit !== undefined) {
    if (!lastVisit) {
      parsedLastVisit = null;
    } else {
      const d = new Date(lastVisit);
      parsedLastVisit = isNaN(d.getTime()) ? null : d;
    }
  }

  return prisma.client.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(surname !== undefined && { surname: surname || "" }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: normalizePhone(phone) || phone }),
      ...(parsedLastVisit !== undefined && { lastVisit: parsedLastVisit }),
      ...(frequentService !== undefined && { frequentService }),
    },
  });
};

export const deleteClient = async (id: string) => {
  await prisma.appointment.updateMany({
    where: { clientId: id },
    data: { clientId: null },
  });

  return prisma.client.delete({
    where: { id },
  });
};

export const getClientById = async (id: string) => {
  return prisma.client.findUnique({
    where: { id },
  });
};

export const resendConsent = async (client: { id: string; businessId: string; phone: string; [key: string]: unknown }) => {
  sendConsentMessage(client.businessId, client).catch((err: unknown) => {
    logger.error("[Clients Service] Error resending LOPD consent request:", err);
  });
};

export const sendMessage = async (client: { businessId: string; phone: string }, message: string) => {
  await whatsappManager.sendMessage(client.businessId, client.phone, message.trim());
  logger.info(`[WhatsApp] Custom message sent to ${maskPhone(client.phone)}`);
};

export default {
  getClientsByBusiness,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
  resendConsent,
  sendMessage,
};
