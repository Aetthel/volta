import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: "/api/auth",
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Fall back to baseUrl if URL parsing fails
      }
      return baseUrl;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request?.nextUrl?.pathname || "";
      const isPublic =
        pathname === "" ||
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/booking") ||
        pathname.startsWith("/lopd") ||
        pathname.startsWith("/api/backend/public") ||
        pathname.startsWith("/api/backend/demo") ||
        pathname.startsWith("/api/backend/auth-security") ||
        pathname.startsWith("/api/auth");

      if (isPublic) return true;
      return isLoggedIn;
    },
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.businessId = user.businessId;
        token.businessName = user.businessName || null;
        token.businessLogoUrl = user.businessLogoUrl || null;
        token.subscriptionStatus = user.subscriptionStatus || "TRIALING";
        token.trialExpiresAt = user.trialExpiresAt || null;
        token.sandboxExpiresAt = user.sandboxExpiresAt || null;
        token.businessType = user.businessType || null;
        token.subscriptionPlan = user.subscriptionPlan || "PRO";
        token.themeColor = user.themeColor || "TEAL";
        token.fontSizeLevel = user.fontSizeLevel || "MEDIUM";
        token.borderRadiusLevel = user.borderRadiusLevel || "MEDIUM";
        token.emailVerified = (user as any).emailVerified ?? false;
      }
      if (trigger === "update" && session) {
        const themeColor =
          session.themeColor ||
          session.user?.themeColor ||
          session.user?.business?.themeColor;
        const fontSizeLevel =
          session.fontSizeLevel ||
          session.user?.fontSizeLevel ||
          session.user?.business?.fontSizeLevel;
        const borderRadiusLevel =
          session.borderRadiusLevel ||
          session.user?.borderRadiusLevel ||
          session.user?.business?.borderRadiusLevel;
        const subscriptionPlan =
          session.subscriptionPlan ||
          session.user?.subscriptionPlan ||
          session.user?.business?.subscriptionPlan;
        const subscriptionStatus =
          session.subscriptionStatus ||
          session.user?.subscriptionStatus ||
          session.user?.business?.subscriptionStatus;
        const trialExpiresAt =
          session.trialExpiresAt !== undefined
            ? session.trialExpiresAt
            : session.user?.trialExpiresAt !== undefined
              ? session.user?.trialExpiresAt
              : session.user?.business?.trialExpiresAt;
        const businessName =
          session.businessName ||
          session.user?.businessName ||
          session.user?.business?.name;
        const businessLogoUrl =
          session.businessLogoUrl !== undefined
            ? session.businessLogoUrl
            : session.user?.businessLogoUrl !== undefined
              ? session.user?.businessLogoUrl
              : session.user?.business?.logoUrl;
        const businessId =
          session.businessId ||
          session.user?.businessId ||
          session.user?.business?.id;
        const role = session.role || session.user?.role;
        const id = session.id || session.user?.id;
        const emailVerified =
          session.emailVerified !== undefined
            ? session.emailVerified
            : session.user?.emailVerified;

        if (businessId) token.businessId = businessId;
        if (role) token.role = role;
        if (id) token.id = id;
        if (themeColor) token.themeColor = themeColor;
        if (fontSizeLevel) token.fontSizeLevel = fontSizeLevel;
        if (borderRadiusLevel) token.borderRadiusLevel = borderRadiusLevel;
        if (subscriptionPlan) token.subscriptionPlan = subscriptionPlan;
        if (subscriptionStatus) token.subscriptionStatus = subscriptionStatus;
        if (trialExpiresAt !== undefined) token.trialExpiresAt = trialExpiresAt;
        if (businessName) token.businessName = businessName;
        if (businessLogoUrl !== undefined) token.businessLogoUrl = businessLogoUrl;
        if (emailVerified !== undefined) token.emailVerified = emailVerified;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        if (!session.user) {
          session.user = {} as any;
        }
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.businessId = token.businessId;
        session.user.businessName = token.businessName || null;
        session.user.businessLogoUrl = token.businessLogoUrl || null;
        session.user.subscriptionStatus = token.subscriptionStatus || "TRIALING";
        session.user.trialExpiresAt = token.trialExpiresAt || null;
        session.user.sandboxExpiresAt = token.sandboxExpiresAt || null;
        session.user.businessType = token.businessType || null;
        session.user.subscriptionPlan = token.subscriptionPlan || "PRO";
        session.user.themeColor = token.themeColor || "TEAL";
        session.user.fontSizeLevel = token.fontSizeLevel || "MEDIUM";
        session.user.borderRadiusLevel = token.borderRadiusLevel || "MEDIUM";
        session.user.emailVerified = token.emailVerified ?? false;
      }
      return session;
    },
  },
  providers: [],
};
