import NextAuth from "next-auth";
import prisma from "backend/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const cleanEmail = String(credentials.email).trim().toLowerCase();
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

          // 2FA Challenge handling
          if (user.twoFactorEnabled) {
            const twoFactorCode = credentials.twoFactorCode ? String(credentials.twoFactorCode).trim() : "";
            if (!twoFactorCode) {
              throw new Error("2FA_REQUIRED:" + user.id);
            }

            const { default: authSecurityService } = await import("backend/auth-security");
            const is2FaValid = await authSecurityService.validateTwoFactorChallenge(user.id, twoFactorCode);
            if (!is2FaValid) {
              throw new Error("INVALID_2FA_CODE");
            }
          }

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
          };
        } catch (error) {
          console.error("[NextAuth] Error during authorize:", error);
          return null;
        }
      },
    }),
  ],
});
