export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // trustHost allows NextAuth to work behind proxies and tunnels (Cloudflare Tunnel,
  // ngrok, etc.) without needing to set NEXTAUTH_URL / AUTH_URL explicitly.
  trustHost: true,
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
        session.user.themeColor = token.themeColor || "TEAL";
        session.user.fontSizeLevel = token.fontSizeLevel || "MEDIUM";
        session.user.borderRadiusLevel = token.borderRadiusLevel || "MEDIUM";
      }
      return session;
    },
  },
  providers: [], // Los proveedores se añaden en auth.js
};
