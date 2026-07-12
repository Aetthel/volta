import prisma from '../config/db.js';
import { sendConsentMessage } from './botService.js';
import whatsappManager from './whatsappService.js';

export const getClientsByBusiness = async (businessId) => {
  return await prisma.client.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
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
      businessId
    }
  });

  sendConsentMessage(businessId, client).catch((err) => {
    console.error('[Clients Service] Error sending LOPD consent request:', err);
  });

  return client;
};

export const updateClient = async (id, clientData) => {
  const { name, surname, email, phone, lopdStatus, lastVisit, frequentService } = clientData;

  return await prisma.client.update({
    where: { id },
    data: {
      name,
      surname,
      email,
      phone,
      lopdStatus,
      lastVisit,
      frequentService
    }
  });
};

export const deleteClient = async (id) => {
  await prisma.appointment.updateMany({
    where: { clientId: id },
    data: { clientId: null }
  });

  return await prisma.client.delete({
    where: { id }
  });
};

export const getClientById = async (id) => {
  return await prisma.client.findUnique({
    where: { id }
  });
};

export const resendConsent = async (client) => {
  sendConsentMessage(client.businessId, client).catch((err) => {
    console.error('[Clients Service] Error resending LOPD consent request:', err);
  });
};

export const sendMessage = async (client, message) => {
  await whatsappManager.sendMessage(client.businessId, client.phone, message.trim());
  console.log(`[WhatsApp] Custom message sent to ${client.phone}`);
};
