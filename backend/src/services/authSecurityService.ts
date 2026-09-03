import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import prisma from "../config/db";
import config from "../config/index";
import { logger } from "../utils/logger";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
} from "./emailService";

// Base32 alphabet for standard RFC 3548 / RFC 4648
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_LOGIN_TTL_MS = 2 * 60 * 1000;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]!;
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

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]!);
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

function generateTotpCode(secretBase32: string, timeStep: number): string {
  const key = base32Decode(secretBase32);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1]! & 0xf;
  const code =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

export function verifyTotp(secretBase32?: string | null, token?: string | null): boolean {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let step = currentStep - 1; step <= currentStep + 1; step++) {
    const expected = generateTotpCode(secretBase32, step);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash?: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`);
  }
  return codes;
}

export async function sendUserVerificationOtp(user: { id: string; email: string; name?: string | null }) {
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

  if (!delivery.success) {
    logger.error(
      `[AuthSecurity] No se pudo entregar el código de verificación a ${user.email}: ${delivery.error}. Código OTP generado para pruebas: ${otpCode}`
    );
  } else {
    logger.info(`[AuthSecurity] Código OTP generado para ${user.email}: ${otpCode}`);
  }

  return { success: true, emailSent: Boolean(delivery.success) };
}

async function issueVerificationLoginToken(userId: string): Promise<string> {
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

export async function consumeVerificationLoginToken(email?: string | null, rawToken?: string | null) {
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

export async function verifyUserOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { business: true },
  });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

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

export async function requestPasswordReset(email: string) {
  const cleanEmail = (email || "").toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

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

export async function resetPasswordWithToken(email: string, rawToken: string, newPassword: string) {
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
      emailVerified: true,
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

export async function setupTwoFactor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado.");

  const randomSecretBuffer = crypto.randomBytes(20);
  const secretBase32 = base32Encode(randomSecretBuffer);

  const otpAuthUrl = `otpauth://totp/Volta:${encodeURIComponent(user.email)}?secret=${secretBase32}&issuer=Volta&period=30&digits=6`;
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
    margin: 2,
    width: 280,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return {
    secret: secretBase32,
    qrCode: qrCodeDataUrl,
    otpAuthUrl,
  };
}

export async function verifyAndEnableTwoFactor(userId: string, secret: string, code: string) {
  const isValid = verifyTotp(secret, code);
  if (!isValid) {
    throw new Error("El código de 6 dígitos introducido es incorrecto.");
  }

  const backupCodes = generateBackupCodes();
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
    backupCodes,
  };
}

export async function disableTwoFactor(userId: string, currentPassword: string) {
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

export async function validateTwoFactorChallenge(userId: string, tokenOrCode: string): Promise<boolean> {
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
    const hashed = user.twoFactorBackupCodes[i]!;
    const isMatch = await comparePassword(normalizedBackup, hashed);
    if (isMatch) {
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

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
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
