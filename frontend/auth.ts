import NextAuth, { CredentialsSignin } from "next-auth";
import prisma from "backend/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

/**
 * NextAuth colapsa cualquier fallo de `authorize()` en un genérico
 * "CredentialsSignin". Estas subclases viajan con un `code` propio, y es lo que
 * permite a la pantalla de acceso distinguir "contraseña incorrecta" de "falta
 * verificar el correo" o "hace falta el segundo factor".
 */
class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

class AccountSuspendedError extends CredentialsSignin {
  code = "ACCOUNT_SUSPENDED";
}

class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

class InvalidTwoFactorCodeError extends CredentialsSignin {
  code = "INVALID_2FA_CODE";
}

/** Forma del usuario que se vuelca en el JWT, común a las dos vías de acceso. */
function toSessionUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    businessName: user.business?.name || null,
    businessLogoUrl: user.business?.logoUrl || null,
    subscriptionStatus: user.business?.subscriptionStatus || "TRIALING",
    trialExpiresAt: user.business?.trialExpiresAt
      ? user.business.trialExpiresAt.toISOString()
      : null,
    sandboxExpiresAt: user.business?.sandboxExpiresAt
      ? user.business.sandboxExpiresAt.toISOString()
      : null,
    businessType: user.business?.businessType || null,
    subscriptionPlan: user.business?.subscriptionPlan || "PRO",
    themeColor: user.business?.themeColor || "CLINICAL_ELEGANCE",
    fontSizeLevel: user.business?.fontSizeLevel || "MEDIUM",
    borderRadiusLevel: user.business?.borderRadiusLevel || "MEDIUM",
    emailVerified: Boolean(user.emailVerified),
  };
}

/**
 * Traduce el ciclo de vida de la cuenta en la decisión de dejar entrar.
 *
 * Se llama siempre DESPUÉS de validar la contraseña, a propósito: si fuera
 * antes, cualquiera podría averiguar el estado de una cuenta ajena sin
 * conocerla.
 */
function assertUserCanSignIn(user: any) {
  if (user.status === "PENDING_VERIFICATION") {
    throw new EmailNotVerifiedError();
  }
  if (user.status === "SUSPENDED") {
    throw new AccountSuspendedError();
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const cleanEmail = String(credentials?.email || "").trim().toLowerCase();
          if (!cleanEmail) return null;

          // ── Vía 1: canje del token de un solo uso ──────────────────────────
          // Lo emite la verificación del correo para abrir sesión sin volver a
          // pedir la contraseña recién escrita en el registro. El servicio lo
          // valida y lo gasta de forma atómica; aquí sólo se acepta el
          // resultado. No pasa por `assertUserCanSignIn` porque el propio
          // consumo ya exige `status: ACTIVE`.
          if (credentials?.loginToken) {
            const { default: authSecurityService } = await import("backend/auth-security");
            const verifiedUser = await authSecurityService.consumeVerificationLoginToken(
              cleanEmail,
              String(credentials.loginToken)
            );

            if (!verifiedUser) {
              if (process.env.NODE_ENV !== "production") {
                console.log("[NextAuth] Verification login token rejected");
              }
              return null;
            }

            return toSessionUser(verifiedUser);
          }

          // ── Vía 2: correo y contraseña ─────────────────────────────────────
          if (!credentials?.password) return null;

          const cleanPassword = String(credentials.password);

          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: cleanEmail,
                mode: "insensitive",
              },
            },
            include: { business: true },
          });

          if (!user) {
            if (process.env.NODE_ENV !== "production") {
              console.log("[NextAuth] User not found");
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);

          if (!isPasswordValid) {
            if (process.env.NODE_ENV !== "production") {
              console.log("[NextAuth] Invalid password");
            }
            return null;
          }

          // Puerta de estado: una cuenta pendiente de verificar no llega a
          // tener sesión. Sin token no hay nada con lo que llamar a la API.
          assertUserCanSignIn(user);

          // 2FA Challenge handling
          if (user.twoFactorEnabled) {
            const twoFactorCode = credentials.twoFactorCode
              ? String(credentials.twoFactorCode).trim()
              : "";
            if (!twoFactorCode) {
              throw new TwoFactorRequiredError();
            }

            const { default: authSecurityService } = await import("backend/auth-security");
            const is2FaValid = await authSecurityService.validateTwoFactorChallenge(
              user.id,
              twoFactorCode
            );
            if (!is2FaValid) {
              throw new InvalidTwoFactorCodeError();
            }
          }

          return toSessionUser(user);
        } catch (error) {
          // Los rechazos con significado (correo sin verificar, 2FA pendiente)
          // tienen que llegar al cliente con su código. El catch de antes se
          // los tragaba y devolvía null, que es la razón de que el desafío 2FA
          // nunca llegase a mostrarse.
          if (error instanceof CredentialsSignin) throw error;

          console.error("[NextAuth] Error during authorize:", error);
          return null;
        }
      },
    }),
  ],
});
