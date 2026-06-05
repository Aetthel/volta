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

        // Database check


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
