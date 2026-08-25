import prisma from "../config/db.js";
import { sendWelcomeMessage } from "./botService.js";
import { CURRENT_POLICY_VERSION } from "../policies/privacyPolicy.js";
import { logger } from "../utils/logger.js";

export const getClientConsent = async (id) => {
  return prisma.client.findUnique({
    where: { id },
    include: { business: true },
  });
};

export const acceptConsent = async (id, metadata = {}) => {
  const {
    ipAddress = "Unknown",
    userAgent = "Unknown",
    policyVersion = CURRENT_POLICY_VERSION,
  } = metadata;

  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    const error = new Error("Client not found");
    error.statusCode = 404;
    throw error;
  }

  // Actualizar el estado LOPD del cliente
  const updatedClient = await prisma.client.update({
    where: { id },
    data: { lopdStatus: "Aceptado" },
  });

  // Crear registro inmutable de auditoría LOPD
  const consentLog = await prisma.lopdConsentLog.create({
    data: {
      clientId: id,
      businessId: client.businessId,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      policyVersion: String(policyVersion),
    },
  });

  // Buscar citas futuras pendientes y enviar mensajes de bienvenida
  const futureAppointments = await prisma.appointment.findMany({
    where: {
      clientId: id,
      appointmentDate: { gte: new Date() },
      status: "PENDING",
    },
  });

  for (const appt of futureAppointments) {
    await sendWelcomeMessage(appt.id);
  }

  return { updatedClient, futureAppointments, consentLog };
};

export const rejectConsent = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    const error = new Error("Client not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: { lopdStatus: "Rechazado" },
  });

  // PENDIENTE (bloqueado por migración): cuando LopdConsentLog tenga la columna
  // `action`, este rechazo debe crear una fila REJECTED igual que acceptConsent
  // crea la de GRANTED. Hasta entonces este log es el único rastro del evento.
  logger.info(
    `[LOPD] Consentimiento rechazado por el cliente ${id} (estado previo: ${client.lopdStatus})`
  );

  return { updatedClient, previousStatus: client.lopdStatus };
};

export const getConsentLogsByClient = async (clientId, businessId) => {
  return prisma.lopdConsentLog.findMany({
    where: { clientId, businessId },
    orderBy: { acceptedAt: "desc" },
  });
};
