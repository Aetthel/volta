import type { NextAuthConfig } from "next-auth";

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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.businessId = (user as any).businessId;
        token.businessName = (user as any).businessName || null;
        token.businessLogoUrl = (user as any).businessLogoUrl || null;
        token.subscriptionStatus = (user as any).subscriptionStatus || "TRIALING";
        token.trialExpiresAt = (user as any).trialExpiresAt || null;
        token.sandboxExpiresAt = (user as any).sandboxExpiresAt || null;
        token.businessType = (user as any).businessType || null;
        token.subscriptionPlan = (user as any).subscriptionPlan || "PRO";
        token.themeColor = (user as any).themeColor || "TEAL";
        token.fontSizeLevel = (user as any).fontSizeLevel || "MEDIUM";
        token.borderRadiusLevel = (user as any).borderRadiusLevel || "MEDIUM";
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
    async session({ session, token }) {
      if (token && session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).businessId = token.businessId;
        (session.user as any).businessName = token.businessName || null;
        (session.user as any).businessLogoUrl = token.businessLogoUrl || null;
        (session.user as any).subscriptionStatus = token.subscriptionStatus || "TRIALING";
        (session.user as any).trialExpiresAt = token.trialExpiresAt || null;
        (session.user as any).sandboxExpiresAt = token.sandboxExpiresAt || null;
        (session.user as any).businessType = token.businessType || null;
        (session.user as any).subscriptionPlan = token.subscriptionPlan || "PRO";
        (session.user as any).themeColor = token.themeColor || "TEAL";
        (session.user as any).fontSizeLevel = token.fontSizeLevel || "MEDIUM";
        (session.user as any).borderRadiusLevel = token.borderRadiusLevel || "MEDIUM";
      }
      return session;
    },
  },
  providers: [],
};
