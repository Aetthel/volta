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
                mode: "insensitive"
              }
            },
            include: { business: true }
          });

          if (!user) {
            console.log(`[NextAuth] User not found for email: ${cleanEmail}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            cleanPassword,
            user.password
          );

          if (!isPasswordValid) {
            console.log(`[NextAuth] Invalid password for user: ${cleanEmail}`);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessId: user.businessId,
            subscriptionStatus: user.business?.subscriptionStatus || "TRIALING",
            trialExpiresAt: user.business?.trialExpiresAt ? user.business.trialExpiresAt.toISOString() : null,
            sandboxExpiresAt: user.business?.sandboxExpiresAt ? user.business.sandboxExpiresAt.toISOString() : null,
            businessType: user.business?.businessType || null,
            subscriptionPlan: user.business?.subscriptionPlan || "PRO",
            themeColor: user.business?.themeColor || "TEAL",
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
