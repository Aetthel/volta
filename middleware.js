import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = nextUrl.pathname === "/login";

  if (isLoggedIn && isLoginRoute) {
    const role = req.auth.user.role;
    return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", nextUrl));
  }

  if (!isLoggedIn && (isAdminRoute || isDashboardRoute)) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isAdminRoute && req.auth.user.role !== "ADMIN") {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
