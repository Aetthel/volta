"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { setupSecurityInterceptor } from "@/lib/securityInterceptor";

export default function SecurityGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Activar el interceptor global de fetch al montar en cliente
    setupSecurityInterceptor();
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const checkPermissions = async () => {
      try {
        const res = await fetch("/api/backend/users/check-permissions");
        if (res.status === 403 || res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (
            data.code === "TRIAL_EXPIRED" ||
            data.code === "PERMISSIONS_REVOKED" ||
            data.redirect === "/"
          ) {
            console.warn("[SecurityGuard] Expulsando usuario al Landing Page (Prueba o permisos expirados)");
            signOut({ callbackUrl: "/" });
          }
        }
      } catch (e) {
        // Red o timeouts temporales no expulsan de forma imprevista
      }
    };

    // 1. Verificación inicial de permisos
    checkPermissions();

    // 2. Intervalo de comprobación en segundo plano cada 30 segundos
    const interval = setInterval(() => {
      checkPermissions();
    }, 30000);

    // 3. Comprobación cuando el usuario vuelve a enfocar la pestaña del navegador
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkPermissions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, status]);

  return null;
}
