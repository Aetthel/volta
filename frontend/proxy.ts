import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const isPublicAuthRoute = pathname === "/" || pathname === "/login" || pathname === "/register";

  // Definición de permisos de rutas por Rol
  const adminRoutes = ["/admin", "/sedes", "/ajustes", "/agenda"];
  const jefeRoutes = ["/inicio", "/clientes", "/ajustes", "/agenda"];
  const empleadoRoutes = ["/inicio", "/clientes", "/ajustes", "/agenda"];
  const allProtectedRoutes = ["/inicio", "/clientes", "/sedes", "/ajustes", "/admin", "/agenda"];

  const isProtectedRoute = allProtectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Redirección si usuario no autenticado intenta acceder a ruta protegida
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const user = req.auth?.user;
  const role = typeof user?.role === "string" ? user.role.toUpperCase() : undefined;

  // 2. Redirección si usuario ya autenticado intenta acceder a la Landing, Login o Register
  if (isLoggedIn && user && isPublicAuthRoute) {
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/inicio", nextUrl));
  }

  // 3. Control de Acceso Basado en Roles (RBAC)
  if (isLoggedIn && isProtectedRoute) {
    if (!user || !role) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (role === "ADMIN") {
      const isAllowed = adminRoutes.some((route) => pathname.startsWith(route));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    } else if (role === "JEFE") {
      const isAllowed = jefeRoutes.some((route) => pathname.startsWith(route));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/inicio", nextUrl));
      }
    } else if (role === "EMPLEADO") {
      const isAllowed = empleadoRoutes.some((route) => pathname.startsWith(route));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/inicio", nextUrl));
      }
    } else {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
