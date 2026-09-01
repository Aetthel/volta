"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import type { BusinessHours } from "@/types/settings";

/** Festivo ya resuelto a una fecha concreta por el backend. */
export interface ObservedHoliday {
  date: string; // "YYYY-MM-DD"
  key: string;
  name: string;
  scope: "NATIONAL" | "REGIONAL";
}

interface HolidaysResponse {
  holidays: ObservedHoliday[];
}

/** "YYYY-MM-DD" en hora local, para casar con las claves que envía el backend. */
const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Días en los que el negocio no atiende: los cerrados por horario semanal
 * (Ajustes) y los festivos españoles que observa.
 *
 * El cálculo de los festivos vive en el backend —incluida la Pascua, de la que
 * cuelga el Viernes Santo—, así que aquí solo se consultan fechas ya resueltas.
 */
export const useBusinessSchedule = (businessId: string) => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<ObservedHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!businessId || businessId === "mock-business-id") return;

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      apiClient.business.getHours<BusinessHours[]>(businessId),
      apiClient.business.getHolidays<HolidaysResponse>(businessId),
    ])
      .then(([hoursRes, holidaysRes]) => {
        if (cancelled) return;
        if (Array.isArray(hoursRes.data)) setHours(hoursRes.data);
        if (Array.isArray(holidaysRes.data?.holidays)) setHolidays(holidaysRes.data.holidays);
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

  // `dayOfWeek` sigue el convenio de Date.getDay() (0 = domingo), el mismo que
  // usa el backend, así que no hace falta traducir índices.
  const closedDays = useMemo(
    () => new Set(hours.filter((h) => h.isClosed).map((h) => h.dayOfWeek)),
    [hours]
  );

  const holidaysByDate = useMemo(
    () => new Map(holidays.map((h) => [h.date, h])),
    [holidays]
  );

  const isDayClosed = useCallback(
    (date: Date) => closedDays.has(date.getDay()) || holidaysByDate.has(toDateKey(date)),
    [closedDays, holidaysByDate]
  );

  /**
   * Motivo por el que el día no admite citas: el nombre del festivo cuando lo
   * hay, y "Cerrado" cuando es el horario semanal.
   */
  const getClosedLabel = useCallback(
    (date: Date) => {
      const holiday = holidaysByDate.get(toDateKey(date));
      if (holiday) return holiday.name;
      return closedDays.has(date.getDay()) ? "Cerrado" : undefined;
    },
    [closedDays, holidaysByDate]
  );

  return { hours, holidays, closedDays, isDayClosed, getClosedLabel, isLoading };
};
