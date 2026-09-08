"use client";

import { useEffect, useRef } from "react";

/**
 * Sondeo que solo corre mientras la pestaña está visible.
 *
 * El dashboard mantenía dos intervalos permanentes por sesión —alertas cada 20 s y
 * permisos cada 30 s— que seguían pidiendo aunque el usuario tuviera la pestaña
 * en segundo plano durante horas. Los navegadores estrangulan los timers ocultos,
 * pero no los detienen: siguen disparando, solo que con menos frecuencia.
 *
 * Al volver a la pestaña se ejecuta de inmediato, sin esperar al siguiente tick,
 * así que la información está fresca justo cuando alguien va a mirarla. Esa es
 * también la razón de que pausar sea seguro para la comprobación de permisos: el
 * chequeo al recuperar el foco ya existía en `SecurityGuard` antes de este hook.
 */
export function useVisiblePolling(
  callback: () => void,
  intervalMs: number,
  enabled = true
): void {
  // Se guarda en una ref para que cambiar la identidad del callback no reinicie el
  // intervalo en cada render.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const detener = () => {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    };

    const arrancar = () => {
      if (interval === null) {
        interval = setInterval(() => callbackRef.current(), intervalMs);
      }
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") {
        callbackRef.current();
        arrancar();
      } else {
        detener();
      }
    };

    // Primera ejecución inmediata, como hacían ambos sondeos antes.
    callbackRef.current();
    if (document.visibilityState === "visible") arrancar();

    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      detener();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [intervalMs, enabled]);
}
