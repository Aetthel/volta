import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import prisma from "../config/db.js";
import config from "../config/index.js";
import { logger } from "../utils/logger.js";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
} from "./emailService.js";

// Base32 alphabet for standard RFC 3548 / RFC 4648
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Validez del código OTP de alta. El texto del correo anuncia estos 10 minutos. */
const OTP_TTL_MS = 10 * 60 * 1000;

/**
 * Validez del token que la pantalla de verificación canjea por sesión. Es un
 * salto inmediato entre dos peticiones seguidas, así que basta con muy poco.
 */
const VERIFICATION_LOGIN_TTL_MS = 2 * 60 * 1000;

/** Nunca se guarda un token en claro: en la base sólo vive su SHA-256. */
function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Base32 encode a buffer into a standard TOTP secret string
 */
function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decode a secret string into a buffer
 */
function base32Decode(input) {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a 6-digit TOTP code for a given secret and counter step
 */
function generateTotpCode(secretBase32, timeStep) {
  const key = base32Decode(secretBase32);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code allowing a +/- 1 step drift window (90s window)
 */
export function verifyTotp(secretBase32, token) {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  // Check current, previous, and next 30s step to account for slight clock skew
  for (let step = currentStep - 1; step <= currentStep + 1; step++) {
    const expected = generateTotpCode(secretBase32, step);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Hashes a plain password using bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Verifies a password against a hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a 6-digit numeric OTP code
 */
export function generateOtpCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Generates 8 single-use alphanumeric backup codes
 */
export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Generates and sends a 6-digit OTP code to verify email
 */
export async function sendUserVerificationOtp(user) {
  const otpCode = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode,
      otpExpiresAt,
      otpAttempts: 0,
    },
  });

  const delivery = await sendOtpEmail(user.email, {
    name: user.name,
    code: otpCode,
  });

  // Ahora que la verificación es obligatoria, un correo que no sale deja la
  // cuenta encerrada. `sendRawEmail` devuelve el fallo en vez de lanzarlo, así
  // que hay que mirarlo y propagarlo para que la interfaz pueda ofrecer reenvío.
  if (!delivery.success) {
    logger.error(
      `[AuthSecurity] No se pudo entregar el código de verificación a ${user.email}: ${delivery.error}`
    );
  }

  return { success: true, emailSent: !!delivery.success };
}

/**
 * Emite el token de un solo uso que la pantalla de verificación canjea por una
 * sesión. Sustituye a pedir de nuevo la contraseña que el usuario acaba de
 * escribir en el registro, sin arrastrarla por la URL ni por el almacenamiento
 * del navegador.
 */
async function issueVerificationLoginToken(userId) {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationLoginToken: hashToken(rawToken),
      verificationLoginExpiresAt: new Date(Date.now() + VERIFICATION_LOGIN_TTL_MS),
    },
  });

  return rawToken;
}

/**
 * Canjea el token de verificación por el usuario al que pertenece, gastándolo.
 *
 * El consumo va en un `updateMany` condicionado en lugar de un find + update:
 * así dos peticiones simultáneas con el mismo token sólo pueden ganar una, y el
 * `count` distingue el caso válido del token gastado, caducado o inexistente
 * sin ramas intermedias que se puedan colar.
 *
 * Se excluye a las cuentas con 2FA: esta vía no pide contraseña, y gastar el
 * token antes de plantear el desafío lo quemaría sin remedio. Una cuenta recién
 * registrada nunca tiene 2FA (se activa desde ajustes, ya con sesión), y quien
 * lo tenga siempre conserva el inicio de sesión normal.
 */
export async function consumeVerificationLoginToken(email, rawToken) {
  const cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail || !rawToken) return null;

  const hashedToken = hashToken(String(rawToken).trim());

  const { count } = await prisma.user.updateMany({
    where: {
      email: cleanEmail,
      verificationLoginToken: hashedToken,
      verificationLoginExpiresAt: { gt: new Date() },
      status: "ACTIVE",
      twoFactorEnabled: false,
    },
    data: {
      verificationLoginToken: null,
      verificationLoginExpiresAt: null,
    },
  });

  if (count !== 1) {
    logger.warn(`[AuthSecurity] Token de verificación inválido o ya gastado para ${cleanEmail}`);
    return null;
  }

  return prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { business: true },
  });
}

/**
 * Verifies an OTP code for account activation
 */
export async function verifyUserOtp(email, code) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { business: true },
  });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  // Esta rama se alcanza sin haber comprobado el código, así que no puede
  // devolver datos del usuario ni emitir el token de sesión: si lo hiciera,
  // bastaría con conocer un correo ya verificado para suplantar la cuenta.
  if (user.emailVerified) {
    return { success: true, alreadyVerified: true };
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error("No hay ningún código de verificación activo. Solicita un reenvío.");
  }

  if (new Date() > new Date(user.otpExpiresAt)) {
    throw new Error("El código de verificación ha expirado. Por favor, solicita uno nuevo.");
  }

  if (user.otpAttempts >= 5) {
    throw new Error("Has superado el número máximo de intentos. Solicita un nuevo código.");
  }

  const isMatch = user.otpCode === code.trim();

  if (!isMatch) {
    await prisma.user.update({
      where: { id: user.id },
      data: { otpAttempts: { increment: 1 } },
    });
    throw new Error("Código de verificación incorrecto.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      // El alta queda activada aquí: `status` es lo que mira `authorize()`.
      // Una cuenta SUSPENDED no se reactiva por verificar el correo.
      status: user.status === "PENDING_VERIFICATION" ? "ACTIVE" : user.status,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
    include: { business: true },
  });

  const loginToken =
    updatedUser.status === "ACTIVE" && !updatedUser.twoFactorEnabled
      ? await issueVerificationLoginToken(updatedUser.id)
      : null;

  return { success: true, user: updatedUser, loginToken };
}

/**
 * Requests a password reset and sends token via email
 */
export async function requestPasswordReset(email) {
  const cleanEmail = (email || "").toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Prevent account enumeration: return success even if user not found
  if (!user) {
    logger.info(`[AuthSecurity] Password reset requested for non-existent email: ${cleanEmail}`);
    return { success: true };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: expiresAt,
    },
  });

  const baseUrl = (config.frontendUrl || "http://localhost:3000").replace(/\/+$/, "");
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

  await sendPasswordResetEmail(cleanEmail, {
    name: user.name,
    resetUrl,
  });

  return { success: true };
}

/**
 * Resets a password using a valid one-time token
 */
export async function resetPasswordWithToken(email, rawToken, newPassword) {
  const cleanEmail = (email || "").toLowerCase().trim();
  const hashedToken = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      email: cleanEmail,
      resetPasswordToken: hashedToken,
    },
  });

  if (!user || !user.resetPasswordExpiresAt) {
    throw new Error("El enlace de restablecimiento es inválido o ya ha sido utilizado.");
  }

  if (new Date() > new Date(user.resetPasswordExpiresAt)) {
    throw new Error("El enlace de restablecimiento ha expirado. Solicita uno nuevo.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      emailVerified: true, // Resetting via email proves ownership
      // Y si esa prueba llega estando el alta pendiente, activa la cuenta. Sin
      // esto quedaba verificada pero bloqueada, y en bucle: el acceso mandaría
      // a verificar, y verificar respondería que ya está verificada.
      ...(user.status === "PENDING_VERIFICATION" ? { status: "ACTIVE" } : {}),
    },
  });

  await sendSecurityAlertEmail(user.email, {
    name: user.name,
    title: "Contraseña Restablecida",
    description: "La contraseña de tu cuenta de Volta ha sido actualizada correctamente tras solicitar el restablecimiento.",
  });

  return { success: true };
}

/**
 * Initializes a new 2FA setup with QR code and secret
 */
export async function setupTwoFactor(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado.");

  const randomSecretBuffer = crypto.randomBytes(20);
  const secretBase32 = base32Encode(randomSecretBuffer);

  const otpAuthUrl = `otpauth://totp/Volta:${encodeURIComponent(user.email)}?secret=${secretBase32}&issuer=Volta&period=30&digits=6`;
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    margin: 2,
    width: 280,
    color: {
      dark: "#0f766e",
      light: "#ffffff",
    },
  });

  return {
    secret: secretBase32,
    qrCode: qrCodeDataUrl,
    otpAuthUrl,
  };
}

/**
 * Verifies a test code and enables 2FA for the user
 */
export async function verifyAndEnableTwoFactor(userId, secret, code) {
  const isValid = verifyTotp(secret, code);
  if (!isValid) {
    throw new Error("El código de 6 dígitos introducido es incorrecto.");
  }

  const backupCodes = generateBackupCodes();
  // Hash backup codes before storing
  const hashedBackupCodes = await Promise.all(
    backupCodes.map((c) => hashPassword(c.replace(/-/g, "")))
  );

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
    },
  });

  await sendSecurityAlertEmail(user.email, {
    name: user.name,
    title: "Autenticación en Dos Pasos (2FA) Activada",
    description: "Has activado correctamente la protección de doble factor (2FA) en tu cuenta.",
  });

  return {
    success: true,
    backupCodes, // Plain text shown once to the user
  };
}

/**
 * Disables 2FA verifying user password
 */
export async function disableTwoFactor(userId, currentPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado.");

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Contraseña actual incorrecta.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  await sendSecurityAlertEmail(user.email, {
    name: user.name,
    title: "Autenticación en Dos Pasos (2FA) Desactivada",
    description: "La protección de doble factor (2FA) ha sido desactivada de tu cuenta.",
  });

  return { success: true };
}

/**
 * Validates a 2FA challenge (TOTP or Backup code) during login
 */
export async function validateTwoFactorChallenge(userId, tokenOrCode) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorEnabled) return false;

  const clean = tokenOrCode.trim();

  // 1. Try TOTP code first
  if (/^\d{6}$/.test(clean)) {
    if (verifyTotp(user.twoFactorSecret, clean)) {
      return true;
    }
  }

  // 2. Try Backup code
  const normalizedBackup = clean.replace(/[\s-]/g, "").toUpperCase();
  for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
    const hashed = user.twoFactorBackupCodes[i];
    const isMatch = await comparePassword(normalizedBackup, hashed);
    if (isMatch) {
      // Consume the used backup code
      const updatedCodes = user.twoFactorBackupCodes.filter((_, idx) => idx !== i);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: updatedCodes },
      });
      logger.info(`[AuthSecurity] Backup code consumed for user ${userId}`);
      return true;
    }
  }

  return false;
}

/**
 * Changes password verifying current password
 */
export async function changeUserPassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado.");

  const isCurrentValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new Error("La contraseña actual no es correcta.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await sendSecurityAlertEmail(user.email, {
    name: user.name,
    title: "Contraseña Actualizada",
    description: "La contraseña de tu cuenta ha sido modificada correctamente desde los ajustes de perfil.",
  });

  return { success: true };
}

export default {
  generateOtpCode,
  sendUserVerificationOtp,
  verifyUserOtp,
  consumeVerificationLoginToken,
  requestPasswordReset,
  resetPasswordWithToken,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  validateTwoFactorChallenge,
  changeUserPassword,
  hashPassword,
  comparePassword,
};
