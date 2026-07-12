import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../backend/src/config/db.js";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Database check


        // Database fallback
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { business: true }
          });

          if (!user) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessId: user.businessId,
            themeColor: user.business?.themeColor || "TEAL",
            fontSizeLevel: user.business?.fontSizeLevel || "MEDIUM",
            borderRadiusLevel: user.business?.borderRadiusLevel || "MEDIUM",
          };
        } catch (error) {
          console.error("Database connection omitted, running in mock mode.", error);
          return null;
        }
      },
    }),
  ],
});
