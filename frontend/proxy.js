import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLoginRoute = pathname === "/login";

  // Defined routes per role
  const adminRoutes = ["/admin", "/sedes", "/ajustes"];
  const businessRoutes = ["/inicio", "/clientes", "/ajustes"];
  const allProtectedRoutes = ["/inicio", "/clientes", "/sedes", "/ajustes", "/admin"];

  const isProtectedRoute = allProtectedRoutes.some(route => pathname.startsWith(route));

  // 1. If not logged in and trying to access a protected route, redirect to /login
  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 2. If logged in and on the login page, redirect to their home page
  if (isLoggedIn && isLoginRoute) {
    const role = req.auth.user.role;
    return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/inicio", nextUrl));
  }

  // 3. If logged in, enforce role restrictions on protected routes
  if (isLoggedIn && isProtectedRoute) {
    const role = req.auth.user.role;

    if (role === "ADMIN") {
      const isAllowed = adminRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
    } else { // default to BUSINESS
      const isAllowed = businessRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) {
        return Response.redirect(new URL("/inicio", nextUrl));
      }
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
