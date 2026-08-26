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

  // El cambio de estado y el registro de auditoría van juntos o no van.
  // Si la segunda escritura fallaba, el cliente quedaba marcado como "Aceptado"
  // sin ninguna fila que lo probara: un consentimiento afirmado e indemostrable,
  // que es peor que no haberlo registrado. La lectura entra también para que el
  // businessId que se escribe en el log sea consistente con el cliente leído.
  const { updatedClient, consentLog } = await prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: { id },
    });

    if (!client) {
      const error = new Error("Client not found");
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

  // El envío de WhatsApp queda FUERA de la transacción a propósito: mantiene
  // abierta una conexión mientras espera al gateway (hasta 45 s en el camino de
  // respaldo) y un fallo de mensajería no debe deshacer un consentimiento válido.
  const futureAppointments = await prisma.appointment.findMany({
    where: {
      clientId: id,
      appointmentDate: { gte: new Date() },
      status: "PENDING",
    },
  });

  // Los envíos se lanzan en paralelo y NO se esperan antes de responder.
  //
  // sendWelcomeMessage encola en BullMQ, pero si Redis no responde cae a un
  // envío directo que espera hasta 45 s al gateway de WhatsApp. En serie y
  // dentro de la petición HTTP, un cliente con tres citas futuras podía
  // quedarse más de dos minutos mirando el spinner —y acabar viendo un error—
  // por un trabajo que ya no le concierne: su consentimiento quedó confirmado
  // en la transacción anterior. Los envíos son consecuencia suya, no requisito.
  //
  // La promesa se devuelve en lugar de quedar suelta para que sea observable:
  // los tests pueden esperarla y nadie tiene que adivinar que existe.
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

/**
 * Años que se conservan los identificadores de red del registro de consentimiento.
 *
 * Alineado con el plazo que declara la política de privacidad v1.2. Se mantiene
 * como constante y no como variable de entorno a propósito: cambiar un plazo de
 * retención es una decisión con efectos legales y debe pasar por revisión de
 * código, igual que el texto de la propia política.
 */
export const CONSENT_IDENTIFIER_RETENTION_YEARS = 3;

/**
 * Marca escrita sobre los identificadores purgados.
 *
 * Se usa "PURGADO" y no "Unknown" porque dicen cosas distintas: "Unknown"
 * afirmaría que el dato nunca se capturó, mientras que esta marca deja
 * constancia de que existió y se eliminó por política de retención.
 */
export const PURGED_IDENTIFIER = "PURGADO";

/**
 * Elimina la IP y el user-agent de los consentimientos que han superado el plazo
 * de conservación, dejando intacta la fila.
 *
 * Lo que prueba el consentimiento —quién, cuándo y qué versión de la política—
 * se conserva. Solo desaparecen los identificadores de red, que estaban ahí para
 * reforzar esa prueba en el momento y cuyo valor decae con el tiempo mientras el
 * riesgo de conservarlos no. Es minimización de datos, no borrado de auditoría.
 */
export const purgeExpiredConsentIdentifiers = async (now = new Date()) => {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - CONSENT_IDENTIFIER_RETENTION_YEARS);

  const { count } = await prisma.lopdConsentLog.updateMany({
    where: {
      acceptedAt: { lt: cutoff },
      // Evita reescribir en cada pasada las filas ya purgadas.
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

export const getConsentLogsByClient = async (clientId, businessId) => {
  return prisma.lopdConsentLog.findMany({
    where: { clientId, businessId },
    orderBy: { acceptedAt: "desc" },
  });
};
