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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [], // Los proveedores se añaden en auth.js
};
