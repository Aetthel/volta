import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../backend/src/db.js";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Mock accounts for quick UI testing
        if (credentials.email === "contacto@glowstudio.com" && credentials.password === "123456") {
          return {
            id: "mock-business-id",
            name: "Glow Studio",
            email: "contacto@glowstudio.com",
            role: "BUSINESS",
          };
        }
        if (credentials.email === "admin@glowstudio.com" && credentials.password === "123456") {
          return {
            id: "mock-admin-id",
            name: "Admin Global",
            email: "admin@glowstudio.com",
            role: "ADMIN",
          };
        }

        // Database fallback
        try {
          const business = await prisma.business.findUnique({
            where: { email: credentials.email },
          });

          if (!business) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            business.password
          );

          if (!isPasswordValid) return null;

          return {
            id: business.id,
            name: business.name,
            email: business.email,
            role: business.role,
          };
        } catch (error) {
          console.error("Database connection omitted, running in mock mode.");
          return null;
        }
      },
    }),
  ],
});
