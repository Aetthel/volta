"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface QueryActionTriggerProps {
  /**
   * Valor esperado en el parámetro para disparar la acción. Si se omite, vale
   * cualquier valor no vacío y se pasa a `onTrigger` (útil para `?buscar=Ana`).
   */
  value?: string;
  onTrigger: (value: string) => void;
  /** Nombre del parámetro. Por defecto `accion`. */
  param?: string;
}

/**
 * Ejecuta una acción de la página cuando se llega a ella con `?accion=...` (o
 * con el parámetro que se indique).
 *
 * Es lo que permite que el buscador global ofrezca "Nueva cita", "Nuevo
 * cliente" o un resultado concreto desde cualquier pantalla: navega a la página
 * correspondiente y esta abre su modal o aplica su filtro. El parámetro se
 * limpia de la URL para que recargar o volver atrás no lo vuelva a disparar.
 *
 * Usa `useSearchParams`, así que debe renderizarse dentro de un <Suspense>.
 */
export default function QueryActionTrigger({
  value,
  onTrigger,
  param = "accion",
}: QueryActionTriggerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    const current = searchParams.get(param);
    const matches = value === undefined ? !!current : current === value;

    if (!matches || !current) {
      // Al salir del estado disparado, rearmamos para la siguiente vez.
      firedFor.current = null;
      return;
    }

    const key = `${pathname}?${param}=${current}`;
    if (firedFor.current === key) return;
    firedFor.current = key;

    onTrigger(current);

    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [searchParams, param, value, onTrigger, router, pathname]);

  return null;
}
