import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const isLoginRoute = pathname === "/login";

  // Defined routes per role
  const adminRoutes = ["/admin", "/sedes", "/ajustes"];
  const jefeRoutes = ["/inicio", "/clientes", "/ajustes"];
  const empleadoRoutes = ["/inicio", "/clientes", "/ajustes"];
  const allProtectedRoutes = ["/inicio", "/clientes", "/sedes", "/ajustes", "/admin"];

  const isProtectedRoute = allProtectedRoutes.some(route => pathname.startsWith(route));

  // 1. If not logged in and trying to access a protected route, redirect to /login
  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  const user = req.auth?.user;
  const role = req.auth?.role || user?.role;

  // 2. If logged in and on the login page, redirect to their home page
  if (isLoggedIn && user && isLoginRoute) {
    return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/inicio", nextUrl));
  }

  // 3. If logged in, enforce role restrictions on protected routes
  if (isLoggedIn && isProtectedRoute) {
    if (!user || !role) {
      return Response.redirect(new URL("/login", nextUrl));
    }

    if (role === "ADMIN") {
      const isAllowed = adminRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
    } else if (role === "JEFE") {
      const isAllowed = jefeRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) {
        return Response.redirect(new URL("/inicio", nextUrl));
      }
    } else if (role === "EMPLEADO") {
      const isAllowed = empleadoRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) {
        return Response.redirect(new URL("/inicio", nextUrl));
      }
    } else {
      return Response.redirect(new URL("/login", nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
