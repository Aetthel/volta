import prisma from "../config/db.js";
// @ts-ignore - botService is an existing JS module
import { sendWelcomeMessage } from "./botService.js";
// @ts-ignore - privacyPolicy is an existing JS module
import { CURRENT_POLICY_VERSION } from "../policies/privacyPolicy.js";
import { logger } from "../utils/logger.js";

export interface ConsentMetadata {
  ipAddress?: string;
  userAgent?: string;
  policyVersion?: string;
}

export const getClientConsent = async (id: string) => {
  return prisma.client.findUnique({
    where: { id },
    include: { business: true },
  });
};

export const acceptConsent = async (id: string, metadata: ConsentMetadata = {}) => {
  const {
    ipAddress = "Unknown",
    userAgent = "Unknown",
    policyVersion = CURRENT_POLICY_VERSION,
  } = metadata;

  const { updatedClient, consentLog } = await prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: { id },
    });

    if (!client) {
      const error = new Error("Client not found") as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const updated = await tx.client.update({
      where: { id },
      data: { lopdStatus: "Aceptado" },
    });

    const log = await tx.lopdConsentLog.create({
      data: {
        clientId: id,
        businessId: client.businessId,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
        policyVersion: String(policyVersion),
      },
    });

    return { updatedClient: updated, consentLog: log };
  });

  const futureAppointments = await prisma.appointment.findMany({
    where: {
      clientId: id,
      appointmentDate: { gte: new Date() },
      status: "PENDING",
    },
  });

  const dispatch = Promise.allSettled(
    futureAppointments.map((appt) => sendWelcomeMessage(appt.id))
  )
    .then((results) => {
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        logger.error(
          `[LOPD] ${failed.length} de ${results.length} mensajes de bienvenida fallaron tras aceptar el consentimiento del cliente ${id}`
        );
      }
    })
    .catch((err) => {
      logger.error(`[LOPD] Error despachando mensajes de bienvenida:`, err);
    });

  return { updatedClient, futureAppointments, consentLog, dispatch };
};

export const rejectConsent = async (id: string) => {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    const error = new Error("Client not found") as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: { lopdStatus: "Rechazado" },
  });

  logger.info(
    `[LOPD] Consentimiento rechazado por el cliente ${id} (estado previo: ${client.lopdStatus})`
  );

  return { updatedClient, previousStatus: client.lopdStatus };
};

export const CONSENT_IDENTIFIER_RETENTION_YEARS = 3;
export const PURGED_IDENTIFIER = "PURGADO";

export const purgeExpiredConsentIdentifiers = async (now = new Date()) => {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - CONSENT_IDENTIFIER_RETENTION_YEARS);

  const { count } = await prisma.lopdConsentLog.updateMany({
    where: {
      acceptedAt: { lt: cutoff },
      NOT: { ipAddress: PURGED_IDENTIFIER },
    },
    data: {
      ipAddress: PURGED_IDENTIFIER,
      userAgent: PURGED_IDENTIFIER,
    },
  });

  if (count > 0) {
    logger.info(
      `[LOPD] Purgados los identificadores de red de ${count} consentimiento(s) anteriores a ${cutoff.toISOString()}`
    );
  }

  return { purgedCount: count, cutoff };
};

export const getConsentLogsByClient = async (clientId: string, businessId: string) => {
  return prisma.lopdConsentLog.findMany({
    where: { clientId, businessId },
    orderBy: { acceptedAt: "desc" },
  });
};

export default {
  getClientConsent,
  acceptConsent,
  rejectConsent,
  purgeExpiredConsentIdentifiers,
  getConsentLogsByClient,
  CONSENT_IDENTIFIER_RETENTION_YEARS,
  PURGED_IDENTIFIER,
};
