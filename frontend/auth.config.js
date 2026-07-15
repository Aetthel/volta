export const authConfig = {
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production" || process.env.AUTH_TRUST_HOST === "true",
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.businessId = user.businessId;
        token.isDemo = user.isDemo || false;
        token.demoExpiresAt = user.demoExpiresAt || null;
        token.themeColor = user.themeColor || "TEAL";
        token.fontSizeLevel = user.fontSizeLevel || "MEDIUM";
        token.borderRadiusLevel = user.borderRadiusLevel || "MEDIUM";
      }
      if (trigger === "update" && session) {
        const themeColor = session.themeColor || session.user?.themeColor;
        const fontSizeLevel = session.fontSizeLevel || session.user?.fontSizeLevel;
        const borderRadiusLevel = session.borderRadiusLevel || session.user?.borderRadiusLevel;

        if (themeColor) token.themeColor = themeColor;
        if (fontSizeLevel) token.fontSizeLevel = fontSizeLevel;
        if (borderRadiusLevel) token.borderRadiusLevel = borderRadiusLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.businessId = token.businessId;
        session.user.isDemo = token.isDemo || false;
        session.user.demoExpiresAt = token.demoExpiresAt || null;
        session.user.themeColor = token.themeColor || "TEAL";
        session.user.fontSizeLevel = token.fontSizeLevel || "MEDIUM";
        session.user.borderRadiusLevel = token.borderRadiusLevel || "MEDIUM";
      }
      return session;
    },
  },
  providers: [], // Los proveedores se añaden en auth.js
};
