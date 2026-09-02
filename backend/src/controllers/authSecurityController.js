import prisma from "../config/db.js";
import { ApiResponse } from "../utils/index.js";
import { logger } from "../utils/logger.js";
import authSecurityService from "../services/authSecurityService.js";

/**
 * Verifies a 6-digit email OTP
 */
export async function verifyOtp(req, res) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "El correo y el código son obligatorios." });
  }

  try {
    const result = await authSecurityService.verifyUserOtp(email, code);

    // La cuenta ya estaba verificada: el código no se ha llegado a comprobar,
    // así que la respuesta no lleva ni datos del usuario ni token de sesión.
    // La pantalla manda a iniciar sesión con normalidad.
    if (result.alreadyVerified) {
      return ApiResponse.success(res, {
        message: "Esta cuenta ya estaba verificada. Inicia sesión con tu contraseña.",
        alreadyVerified: true,
      });
    }

    return ApiResponse.success(res, {
      message: "Correo verificado correctamente.",
      alreadyVerified: false,
      // De un solo uso y con dos minutos de vida: lo canjea `authorize()` para
      // abrir sesión sin volver a pedir la contraseña del registro.
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
  } catch (err) {
    logger.warn(`[AuthSecurityController] OTP verification failed: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Resends a fresh OTP code to user email
 */
export async function resendOtp(req, res) {
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

    // Un reenvío que no sale deja al usuario esperando un correo que no llega,
    // así que se responde con error en vez de con un éxito que no lo es.
    if (!result.emailSent) {
      return res.status(502).json({
        error: "No hemos podido enviar el correo en este momento. Inténtalo de nuevo en unos minutos.",
      });
    }

    return ApiResponse.success(res, {
      message: "Se ha enviado un nuevo código a tu correo.",
    });
  } catch (err) {
    logger.error(`[AuthSecurityController] Error resending OTP: ${err.message}`);
    return res.status(500).json({ error: "Error al enviar el código de verificación." });
  }
}

/**
 * Requests a password reset link
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  try {
    await authSecurityService.requestPasswordReset(email);
    return ApiResponse.success(res, {
      message: "Si el correo existe en nuestra plataforma, recibirás las instrucciones para restablecer tu contraseña.",
    });
  } catch (err) {
    logger.error(`[AuthSecurityController] Error in forgotPassword: ${err.message}`);
    return res.status(500).json({ error: "Error al procesar la solicitud de recuperación." });
  }
}

/**
 * Resets password using token
 */
export async function resetPassword(req, res) {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  try {
    await authSecurityService.resetPasswordWithToken(email, token, newPassword);
    return ApiResponse.success(res, {
      message: "Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.",
    });
  } catch (err) {
    logger.warn(`[AuthSecurityController] Reset password failed: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Generates 2FA setup details (QR code & secret)
 */
export async function setupTwoFactor(req, res) {
  const userId = req.user.id;

  try {
    const data = await authSecurityService.setupTwoFactor(userId);
    return ApiResponse.success(res, data);
  } catch (err) {
    logger.error(`[AuthSecurityController] Error in setupTwoFactor: ${err.message}`);
    return res.status(500).json({ error: "Error al configurar 2FA." });
  }
}

/**
 * Verifies code and enables 2FA
 */
export async function verifyAndEnableTwoFactor(req, res) {
  const userId = req.user.id;
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
  } catch (err) {
    logger.warn(`[AuthSecurityController] Error enabling 2FA: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Disables 2FA verifying user password
 */
export async function disableTwoFactor(req, res) {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Debes confirmar tu contraseña actual." });
  }

  try {
    await authSecurityService.disableTwoFactor(userId, password);
    return ApiResponse.success(res, {
      message: "Autenticación en Dos Pasos desactivada.",
    });
  } catch (err) {
    logger.warn(`[AuthSecurityController] Error disabling 2FA: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Validates a 2FA challenge during login
 */
export async function validateTwoFactorChallenge(req, res) {
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
  } catch (err) {
    logger.error(`[AuthSecurityController] 2FA validation error: ${err.message}`);
    return res.status(500).json({ error: "Error al validar el código de seguridad." });
  }
}

/**
 * Changes authenticated user password
 */
export async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    await authSecurityService.changeUserPassword(userId, currentPassword, newPassword);
    return ApiResponse.success(res, {
      message: "Contraseña actualizada correctamente.",
    });
  } catch (err) {
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
