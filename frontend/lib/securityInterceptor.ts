"use client";

import { signOut } from "next-auth/react";

let interceptorInitialized = false;
let isSigningOut = false;

export function resetSecurityInterceptorForTesting() {
  interceptorInitialized = false;
  isSigningOut = false;
}

export function setupSecurityInterceptor() {
  if (typeof window === "undefined" || interceptorInitialized) return;
  interceptorInitialized = true;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";

    if (
      url.includes("__nextjs") ||
      url.includes("_next") ||
      url.includes("/api/auth") ||
      url.includes("/api/backend/users/register") ||
      url.includes("/api/backend/demo") ||
      url.includes("/api/backend/public") ||
      url.includes("/api/backend/lopd")
    ) {
      return originalFetch(...args);
    }

    const response = await originalFetch(...args);

    if (response.status === 401 || response.status === 403) {
      if (!isSigningOut) {
        try {
          const clone = response.clone();
          const data = await clone.json().catch(() => null);

          // If 401 (session expired / unauthorized) or specific 403 expulsion codes
          const isExpulsion =
            response.status === 401 ||
            data?.code === "TRIAL_EXPIRED" ||
            data?.code === "PERMISSIONS_REVOKED" ||
            data?.code === "SESSION_ORPHANED" ||
            data?.code === "UNAUTHORIZED";

          if (isExpulsion) {
            isSigningOut = true;
            console.warn(
              "[SecurityGuard] Sesión expirada o permisos no válidos (HTTP %d, código: %s). Redirigiendo a login.",
              response.status,
              data?.code || "UNAUTHORIZED"
            );
            await signOut({ callbackUrl: "/login" });
          }
        } catch (e) {
          if (response.status === 401) {
            isSigningOut = true;
            await signOut({ callbackUrl: "/login" });
          }
        }
      }
    }

    return response;
  };
}
