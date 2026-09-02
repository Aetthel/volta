import prisma from "../config/db.js";
import { ApiResponse } from "../utils/index.js";
import { logger } from "../utils/logger.js";
import authSecurityService from "../services/authSecurityService.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export async function verifyOtp(req: Request, res: Response) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "El correo y el código son obligatorios." });
  }

  try {
    const result = await authSecurityService.verifyUserOtp(email, code);

    if (result.alreadyVerified || !result.user) {
      return ApiResponse.success(res, {
        message: "Esta cuenta ya estaba verificada. Inicia sesión con tu contraseña.",
        alreadyVerified: true,
      });
    }

    return ApiResponse.success(res, {
      message: "Correo verificado correctamente.",
      alreadyVerified: false,
      loginToken: result.loginToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        businessId: result.user.businessId,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
      },
    });
  } catch (err: any) {
    logger.warn(`[AuthSecurityController] OTP verification failed: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

export async function resendOtp(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.emailVerified) {
      return ApiResponse.success(res, {
        message: "La cuenta ya está verificada.",
        alreadyVerified: true,
      });
    }

    const result = await authSecurityService.sendUserVerificationOtp(user);

    if (!result.emailSent) {
      return res.status(502).json({
        error: "No hemos podido enviar el correo en este momento. Inténtalo de nuevo en unos minutos.",
      });
    }

    return ApiResponse.success(res, {
      message: "Se ha enviado un nuevo código a tu correo.",
    });
  } catch (err: any) {
    logger.error(`[AuthSecurityController] Error resending OTP: ${err.message}`);
    return res.status(500).json({ error: "Error al enviar el código de verificación." });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  try {
    await authSecurityService.requestPasswordReset(email);
    return ApiResponse.success(res, {
      message: "Si el correo existe en nuestra plataforma, recibirás las instrucciones para restablecer tu contraseña.",
    });
  } catch (err: any) {
    logger.error(`[AuthSecurityController] Error in forgotPassword: ${err.message}`);
    return res.status(500).json({ error: "Error al procesar la solicitud de recuperación." });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  try {
    await authSecurityService.resetPasswordWithToken(email, token, newPassword);
    return ApiResponse.success(res, {
      message: "Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.",
    });
  } catch (err: any) {
    logger.warn(`[AuthSecurityController] Reset password failed: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

export async function setupTwoFactor(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const data = await authSecurityService.setupTwoFactor(userId);
    return ApiResponse.success(res, data);
  } catch (err: any) {
    logger.error(`[AuthSecurityController] Error in setupTwoFactor: ${err.message}`);
    return res.status(500).json({ error: "Error al configurar 2FA." });
  }
}

export async function verifyAndEnableTwoFactor(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { secret, code } = req.body;

  if (!secret || !code) {
    return res.status(400).json({ error: "El secreto y el código son requeridos." });
  }

  try {
    const result = await authSecurityService.verifyAndEnableTwoFactor(userId, secret, code);
    return ApiResponse.success(res, {
      message: "Autenticación en Dos Pasos activada correctamente.",
      backupCodes: result.backupCodes,
    });
  } catch (err: any) {
    logger.warn(`[AuthSecurityController] Error enabling 2FA: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

export async function disableTwoFactor(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Debes confirmar tu contraseña actual." });
  }

  try {
    await authSecurityService.disableTwoFactor(userId, password);
    return ApiResponse.success(res, {
      message: "Autenticación en Dos Pasos desactivada.",
    });
  } catch (err: any) {
    logger.warn(`[AuthSecurityController] Error disabling 2FA: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

export async function validateTwoFactorChallenge(req: Request, res: Response) {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: "Identificador de usuario y código requeridos." });
  }

  try {
    const isValid = await authSecurityService.validateTwoFactorChallenge(userId, code);
    if (!isValid) {
      return res.status(400).json({ error: "Código 2FA o código de respaldo inválido." });
    }

    return ApiResponse.success(res, { valid: true });
  } catch (err: any) {
    logger.error(`[AuthSecurityController] 2FA validation error: ${err.message}`);
    return res.status(500).json({ error: "Error al validar el código de seguridad." });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    await authSecurityService.changeUserPassword(userId, currentPassword, newPassword);
    return ApiResponse.success(res, {
      message: "Contraseña actualizada correctamente.",
    });
  } catch (err: any) {
    logger.warn(`[AuthSecurityController] Change password failed: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

export default {
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  validateTwoFactorChallenge,
  changePassword,
};
