"use client";

import { signOut } from "next-auth/react";

let interceptorInitialized = false;

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
      url.includes("/api/backend/public")
    ) {
      return originalFetch(...args);
    }

    const response = await originalFetch(...args);

    if (response.status === 403 || response.status === 401) {
      try {
        const clone = response.clone();
        const data = await clone.json();

        if (
          data &&
          (data.code === "TRIAL_EXPIRED" || data.code === "PERMISSIONS_REVOKED")
        ) {
          console.warn("[SecurityGuard] Expulsión por prueba finalizada o permisos revocados:", data.code);
          signOut({ callbackUrl: "/" });
        }
      } catch (e) {
        // Ignorar si la respuesta no contiene un payload JSON válido
      }
    }

    return response;
  };
}
