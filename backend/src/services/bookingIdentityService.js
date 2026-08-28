import crypto from "crypto";
import prisma from "../config/db.js";
import config from "../config/index.js";
import whatsappManager from "./whatsappService.js";
import { computeHmac, signToken, verifyToken, normalizePhone } from "../utils/index.js";
import { logger, maskPhone } from "../utils/logger.js";

/** Validez del código de un solo uso. */
export const CODE_TTL_SECONDS = 5 * 60;
/** Validez de la sesión de reserva emitida al verificar. */
export const SESSION_TTL_SECONDS = 30 * 60;
/** Intentos fallidos que admite un código antes de quedar invalidado. */
export const MAX_ATTEMPTS = 5;
/** Códigos que se pueden pedir por teléfono y negocio dentro de la ventana. */
export const MAX_CODES_PER_WINDOW = 3;
export const RESEND_WINDOW_MS = 15 * 60 * 1000;
/** Los datos de verificación se purgan a las 24h (retención LOPD). */
export const RETENTION_MS = 24 * 60 * 60 * 1000;

export const BOOKING_TOKEN_SCOPE = "public-booking";

const httpError = (statusCode, message, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, extra);
  return error;
};

/** Código de 6 dígitos con entropía criptográfica (no `Math.random`). */
const generateCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

/**
 * El hash liga el código al negocio y al teléfono: un código filtrado no sirve
 * para verificar otro número ni en otro negocio, aunque coincidan los 6 dígitos.
 */
const hashCode = (businessId, phone, code) =>
  computeHmac(`${businessId}:${phone}:${code}`, config.bookingJwtSecret);

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const maskForDisplay = (phone) => {
  if (!phone || phone.length <= 3) return "***";
  return `${"•".repeat(Math.max(0, phone.length - 3))}${phone.slice(-3)}`;
};

/**
 * Avisa al negocio de que su portal de reservas no puede verificar a nadie.
 * La alerta va a los responsables (JEFE), no al empleado que esté de turno, y
 * se emite una sola vez mientras siga sin leerse: el fallo es continuo y no
 * tiene sentido llenarle el buzón con una alerta por visitante rebotado.
 */
const alertBusinessGatewayDown = async (businessId) => {
  const title = "Reservas online bloqueadas: WhatsApp desconectado";

  try {
    const owners = await prisma.user.findMany({
      where: { businessId, role: { in: ["JEFE", "ADMIN"] } },
      select: { id: true },
    });

    for (const owner of owners) {
      const existing = await prisma.alert.findFirst({
        where: { userId: owner.id, title, isRead: false },
      });
      if (existing) continue;

      await prisma.alert.create({
        data: {
          type: "EMERGENTE",
          title,
          description:
            "Tus clientes no pueden reservar online porque no se les puede enviar el código de verificación. Vuelve a vincular WhatsApp en Ajustes para reactivar las reservas.",
          userId: owner.id,
          isRead: false,
        },
      });
    }
  } catch (err) {
    // Que falle el aviso no debe cambiar la respuesta que recibe el visitante.
    logger.error(`[BookingIdentity] No se pudo crear la alerta de gateway caído: ${err.message}`);
  }
};

const findClientByPhone = (businessId, phone) =>
  prisma.client.findFirst({
    where: { businessId, phone },
    select: { id: true, name: true, surname: true },
  });

const countRecentCodes = (businessId, phone) =>
  prisma.bookingVerification.count({
    where: {
      businessId,
      phone,
      createdAt: { gte: new Date(Date.now() - RESEND_WINDOW_MS) },
    },
  });

/**
 * Primer paso: reconoce el teléfono y, si procede, envía el código.
 *
 * @returns {Promise<{state: "NAME_REQUIRED"|"OTP_SENT", ...}>}
 */
export const startVerification = async ({ businessId, phone, fullName, ipAddress }) => {
  const canonicalPhone = normalizePhone(phone);

  if (!canonicalPhone || canonicalPhone.length < 9) {
    throw httpError(400, "Introduce un número de teléfono móvil válido.");
  }

  const client = await findClientByPhone(businessId, canonicalPhone);
  const isRegistered = Boolean(client);
  const trimmedName = typeof fullName === "string" ? fullName.trim() : "";

  // El visitante que no consta como cliente tiene que decir quién es antes de
  // que le mandemos nada: sin nombre, la reserva no podría crear su ficha.
  if (!isRegistered && trimmedName.length < 3) {
    return { state: "NAME_REQUIRED", isRegistered: false };
  }

  const recentCodes = await countRecentCodes(businessId, canonicalPhone);
  if (recentCodes >= MAX_CODES_PER_WINDOW) {
    throw httpError(
      429,
      "Has pedido demasiados códigos. Espera unos minutos antes de volver a intentarlo.",
      { retryAfterSeconds: Math.ceil(RESEND_WINDOW_MS / 1000) }
    );
  }

  if (!whatsappManager.isReady(businessId)) {
    await alertBusinessGatewayDown(businessId);
    throw httpError(
      503,
      "Ahora mismo no podemos enviarte el código de verificación. Inténtalo de nuevo en unos minutos o contacta con el negocio."
    );
  }

  const code = generateCode();

  // Se envía antes de persistir a propósito: si el envío falla, el visitante no
  // se queda con un intento gastado ni con un código válido que nunca recibió.
  try {
    await whatsappManager.sendMessage(
      businessId,
      canonicalPhone,
      `Tu código para completar la reserva es ${code}. Caduca en 5 minutos. Si no has sido tú, ignora este mensaje.`
    );
  } catch (err) {
    logger.error(
      `[BookingIdentity] Fallo al enviar el código a ${maskPhone(canonicalPhone)}: ${err.message}`
    );
    await alertBusinessGatewayDown(businessId);
    throw httpError(
      503,
      "No hemos podido enviarte el código de verificación. Inténtalo de nuevo en unos minutos."
    );
  }

  // Solo vale el último código pedido.
  await prisma.bookingVerification.updateMany({
    where: { businessId, phone: canonicalPhone, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.bookingVerification.create({
    data: {
      businessId,
      phone: canonicalPhone,
      pendingName: isRegistered ? null : trimmedName,
      codeHash: hashCode(businessId, canonicalPhone, code),
      expiresAt: new Date(Date.now() + CODE_TTL_SECONDS * 1000),
      ipAddress: ipAddress || null,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    logger.warn(`[BookingIdentity] [DEV] Código para ${maskPhone(canonicalPhone)}: ${code}`);
  }

  return {
    state: "OTP_SENT",
    isRegistered,
    maskedPhone: maskForDisplay(canonicalPhone),
    expiresInSeconds: CODE_TTL_SECONDS,
    codesLeft: MAX_CODES_PER_WINDOW - recentCodes - 1,
  };
};

/** Emite la credencial de sesión del portal. */
export const issueBookingToken = ({ businessId, phone, name }) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;

  const token = signToken(
    { scope: BOOKING_TOKEN_SCOPE, businessId, phone, name: name || null, exp: expiresAt },
    config.bookingJwtSecret
  );

  return { token, expiresAt: new Date(expiresAt * 1000).toISOString() };
};

/**
 * Valida el token de sesión. Devuelve `null` si la firma no cuadra, si ha
 * caducado, si no es del ámbito del portal público o si es de otro negocio.
 */
export const verifyBookingToken = (token, businessId) => {
  const payload = verifyToken(token, config.bookingJwtSecret);
  if (!payload) return null;
  if (payload.scope !== BOOKING_TOKEN_SCOPE) return null;
  if (!payload.businessId || !payload.phone) return null;
  if (businessId && payload.businessId !== businessId) return null;
  return { businessId: payload.businessId, phone: payload.phone, name: payload.name || null };
};

/** Segundo paso: comprueba el código y abre la sesión de reserva. */
export const verifyCode = async ({ businessId, phone, code }) => {
  const canonicalPhone = normalizePhone(phone);

  const verification = await prisma.bookingVerification.findFirst({
    where: { businessId, phone: canonicalPhone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    throw httpError(400, "El código no es válido. Solicita uno nuevo.");
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    throw httpError(400, "El código ha caducado. Solicita uno nuevo.", { expired: true });
  }

  if (verification.attempts >= MAX_ATTEMPTS) {
    await prisma.bookingVerification.update({
      where: { id: verification.id },
      data: { consumedAt: new Date() },
    });
    throw httpError(400, "Has agotado los intentos. Solicita un código nuevo.");
  }

  if (!safeEqual(verification.codeHash, hashCode(businessId, canonicalPhone, String(code).trim()))) {
    const updated = await prisma.bookingVerification.update({
      where: { id: verification.id },
      data: {
        attempts: { increment: 1 },
        // Al quinto fallo el código muere aquí mismo, sin esperar a otro intento.
        ...(verification.attempts + 1 >= MAX_ATTEMPTS ? { consumedAt: new Date() } : {}),
      },
    });

    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - updated.attempts);
    throw httpError(
      400,
      attemptsLeft > 0
        ? `Código incorrecto. Te ${attemptsLeft === 1 ? "queda 1 intento" : `quedan ${attemptsLeft} intentos`}.`
        : "Has agotado los intentos. Solicita un código nuevo.",
      { attemptsLeft }
    );
  }

  await prisma.bookingVerification.update({
    where: { id: verification.id },
    data: { consumedAt: new Date() },
  });

  const client = await findClientByPhone(businessId, canonicalPhone);
  const displayName = client
    ? [client.name, client.surname].filter(Boolean).join(" ").trim()
    : verification.pendingName;

  const { token, expiresAt } = issueBookingToken({
    businessId,
    phone: canonicalPhone,
    name: displayName,
  });

  logger.info(
    `[BookingIdentity] Sesión de reserva emitida para ${maskPhone(canonicalPhone)} en ${businessId}`
  );

  return {
    bookingToken: token,
    expiresAt,
    displayName,
    isRegistered: Boolean(client),
  };
};

/** Purga de retención: se ejecuta a diario desde el cron del backend. */
export const purgeExpiredVerifications = async () => {
  const { count } = await prisma.bookingVerification.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
  });

  if (count > 0) {
    logger.info(`[BookingIdentity] Purgadas ${count} verificaciones de más de 24h.`);
  }

  return count;
};
