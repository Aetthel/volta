"use client";

import { signOut } from "next-auth/react";

let interceptorInitialized = false;

export function setupSecurityInterceptor() {
  if (typeof window === "undefined" || interceptorInitialized) return;
  interceptorInitialized = true;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    // Ejecutar siempre bound al objeto window para compatibilidad estricta con Safari
    const response = await originalFetch.apply(window, args);

      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
      if (
        url.includes("__nextjs") ||
        url.includes("_next") ||
        url.includes("/api/auth") ||
        url.includes("/api/backend/users/register") ||
        url.includes("/api/backend/demo") ||
        url.includes("/api/backend/public")
      ) {
        return response;
      }

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
