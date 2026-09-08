"use client";

import { useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { setupSecurityInterceptor } from "@/lib/securityInterceptor";
import { apiClient } from "@/lib/apiClient";
import { useVisiblePolling } from "@/hooks/useVisiblePolling";

export default function SecurityGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Activar el interceptor global de fetch al montar en cliente
    setupSecurityInterceptor();
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      const res = await apiClient.get("/users/check-permissions");
      if (res.status === 403 || res.status === 401) {
        const data = (res.errorData ?? {}) as {
          code?: string;
          redirect?: string;
        };
        const isExpulsion =
          data.code === "TRIAL_EXPIRED" ||
          data.code === "PERMISSIONS_REVOKED" ||
          data.code === "SESSION_ORPHANED" ||
          data.code === "UNAUTHORIZED" ||
          Boolean(data.redirect);

        if (isExpulsion) {
          console.warn(
            "[SecurityGuard] Expulsando usuario al Login (Sesión expirada o permisos no válidos)"
          );
          signOut({ callbackUrl: "/login" });
        }
      }
    } catch (e) {
      // Red o timeouts temporales no expulsan de forma imprevista
    }
  }, []);

  // El hook comprueba al montar y al recuperar el foco, y detiene el intervalo
  // mientras la pestaña está oculta: una pestaña en segundo plano no necesita
  // vigilancia, y al volver se revalida antes de que el usuario toque nada. Ese
  // chequeo al recuperar el foco ya existía aquí, y es lo que hace seguro pausar.
  useVisiblePolling(
    checkPermissions,
    30000,
    status === "authenticated" && Boolean(session?.user)
  );

  return null;
}
