import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
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
    authorized({ auth }) {
      const isLoggedIn = !!auth?.user;
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
      }
      if (trigger === "update" && session) {
        const themeColor = session.themeColor || session.user?.themeColor;
        const fontSizeLevel = session.fontSizeLevel || session.user?.fontSizeLevel;
        const borderRadiusLevel = session.borderRadiusLevel || session.user?.borderRadiusLevel;
        const subscriptionPlan = session.subscriptionPlan || session.user?.subscriptionPlan;
        const subscriptionStatus = session.subscriptionStatus || session.user?.subscriptionStatus;
        const trialExpiresAt = session.trialExpiresAt !== undefined ? session.trialExpiresAt : session.user?.trialExpiresAt;
        const businessName = session.businessName || session.user?.businessName;
        const businessLogoUrl = session.businessLogoUrl || session.user?.businessLogoUrl;

        if (themeColor) token.themeColor = themeColor;
        if (fontSizeLevel) token.fontSizeLevel = fontSizeLevel;
        if (borderRadiusLevel) token.borderRadiusLevel = borderRadiusLevel;
        if (subscriptionPlan) token.subscriptionPlan = subscriptionPlan;
        if (subscriptionStatus) token.subscriptionStatus = subscriptionStatus;
        if (trialExpiresAt !== undefined) token.trialExpiresAt = trialExpiresAt;
        if (businessName) token.businessName = businessName;
        if (businessLogoUrl !== undefined) token.businessLogoUrl = businessLogoUrl;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session?.user) {
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
      }
      return session;
    },
  },
  providers: [],
};
