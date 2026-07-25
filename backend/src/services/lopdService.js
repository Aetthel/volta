import prisma from "../config/db.js";
import { sendWelcomeMessage } from "./botService.js";

export const getClientConsent = async (id) => {
  return prisma.client.findUnique({
    where: { id },
    include: { business: true },
  });
};

export const acceptConsent = async (id, metadata = {}) => {
  const { ipAddress = "127.0.0.1", userAgent = "Unknown", policyVersion = "1.0" } = metadata;

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

export const getConsentLogsByClient = async (clientId, businessId) => {
  return prisma.lopdConsentLog.findMany({
    where: { clientId, businessId },
    orderBy: { acceptedAt: "desc" },
  });
};
