"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import type { BusinessHours } from "@/types/settings";

/**
 * Horario comercial del negocio, pensado para pintar y bloquear en el calendario
 * los días marcados como cerrados en Ajustes.
 *
 * `dayOfWeek` sigue el convenio de `Date.getDay()` (0 = domingo), el mismo que
 * usa el modelo `BusinessHours` del backend, así que no hace falta traducir
 * índices al comparar con una fecha.
 */
export const useBusinessHours = (businessId: string) => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!businessId || businessId === "mock-business-id") return;

    let cancelled = false;
    setIsLoading(true);

    apiClient.business
      .getHours<BusinessHours[]>(businessId)
      .then((res) => {
        if (cancelled || !Array.isArray(res.data)) return;
        setHours(res.data);
      })
      // El calendario debe seguir siendo usable aunque el horario no cargue: sin
      // datos no se marca ningún día como cerrado, que es el estado permisivo.
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const closedDays = useMemo(
    () => new Set(hours.filter((h) => h.isClosed).map((h) => h.dayOfWeek)),
    [hours]
  );

  const isDayClosed = useCallback(
    (date: Date) => closedDays.has(date.getDay()),
    [closedDays]
  );

  return { hours, closedDays, isDayClosed, isLoading };
};
