import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "backend/db";
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
      },
    }),
  ],
});
