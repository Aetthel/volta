"use client";

import { useCallback, useEffect, useState } from "react";

export interface BookingIdentity {
  phone: string;
  name: string;
}

export interface BookingSession {
  token: string;
  expiresAt: string;
  identity: BookingIdentity;
}

const storageKey = (businessId: string) => `volta:booking:${businessId}`;

/**
 * El portal se abre a menudo desde el navegador embebido de WhatsApp o
 * Instagram, donde el almacenamiento puede estar bloqueado. Leer o escribir la
 * sesión nunca debe tumbar la página: si falla, el visitante simplemente vuelve
 * a verificar su teléfono.
 */
const readSession = (businessId: string): BookingSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(storageKey(businessId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BookingSession;
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;

    return parsed;
  } catch {
    return null;
  }
};

const writeSession = (businessId: string, session: BookingSession | null) => {
  if (typeof window === "undefined") return;

  try {
    if (session) {
      window.sessionStorage.setItem(storageKey(businessId), JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(storageKey(businessId));
    }
  } catch {
    // Sin almacenamiento la sesión vive solo en memoria: sigue siendo usable
    // durante esta visita, que es lo único que necesita el flujo de reserva.
  }
};

export function useBookingSession(businessId: string) {
  const [session, setSession] = useState<BookingSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // La sesión se lee después del montaje: en el render del servidor no existe
  // `sessionStorage`, y leerla durante el render rompería la hidratación.
  useEffect(() => {
    setSession(readSession(businessId));
    setIsRestoring(false);
  }, [businessId]);

  const startSession = useCallback(
    (next: BookingSession) => {
      writeSession(businessId, next);
      setSession(next);
    },
    [businessId]
  );

  const clearSession = useCallback(() => {
    writeSession(businessId, null);
    setSession(null);
  }, [businessId]);

  /**
   * `fetch` con la credencial del portal. Un 401 significa que la sesión ha
   * caducado o ha dejado de ser válida: se limpia para devolver al visitante a
   * la pantalla de identificación, sin tocar el resto del estado del asistente.
   */
  const authFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (session?.token) headers.set("x-booking-token", session.token);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        clearSession();
      }

      return response;
    },
    [session, clearSession]
  );

  return {
    session,
    identity: session?.identity ?? null,
    token: session?.token ?? null,
    isVerified: Boolean(session),
    isRestoring,
    startSession,
    clearSession,
    authFetch,
  };
}

export default useBookingSession;
