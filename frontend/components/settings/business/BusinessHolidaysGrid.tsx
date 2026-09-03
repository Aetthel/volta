"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Loader2, Check } from "lucide-react";
import type { ToastState } from "@/types/settings";
import { Skeleton } from "@/components/ui/volta-ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

/** Entrada del catálogo tal y como la devuelve el backend. */
interface HolidayCatalogueItem {
  key: string;
  name: string;
  scope: "NATIONAL" | "REGIONAL";
  note: string | null;
  date: string; // "YYYY-MM-DD" del año en curso
  isObserved: boolean;
  isDefault: boolean;
}

interface HolidaysResponse {
  catalogue: HolidayCatalogueItem[];
}

interface BusinessHolidaysGridProps {
  businessId: string;
  setToast: (toast: ToastState) => void;
}

const formatHolidayDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
};

export const BusinessHolidaysGrid: React.FC<BusinessHolidaysGridProps> = ({
  businessId,
  setToast,
}) => {
  const [catalogue, setCatalogue] = useState<HolidayCatalogueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const fetchHolidays = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") return;
    setIsLoading(true);
    try {
      const res = await apiClient.business.getHolidays<HolidaysResponse>(businessId);
      if (Array.isArray(res.data?.catalogue)) setCatalogue(res.data.catalogue);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const toggleHoliday = async (key: string) => {
    const next = catalogue.map((h) => (h.key === key ? { ...h, isObserved: !h.isObserved } : h));
    setCatalogue(next);
    if (!businessId || businessId === "mock-business-id") return;
    setSaveStatus("saving");
    try {
      const payload = next.map((h) => ({ holidayKey: h.key, isObserved: h.isObserved }));
      const res = await apiClient.business.updateHolidays<HolidaysResponse>(businessId, payload);
      if (res.error) throw new Error(res.error);
      if (Array.isArray(res.data?.catalogue)) setCatalogue(res.data.catalogue);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("idle");
      setToast({ show: true, text: "Error al guardar los festivos" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    }
  };

  const nationals = catalogue.filter((h) => h.scope === "NATIONAL");
  const regionals = catalogue.filter((h) => h.scope === "REGIONAL");

  const renderRow = (holiday: HolidayCatalogueItem) => (
    <label
      key={holiday.key}
      title={holiday.note || undefined}
      className="flex items-center justify-between gap-2 border-b border-outline-variant/30 py-1.5 cursor-pointer"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-semibold text-on-surface">{holiday.name}</span>
        <span className="text-[11px] text-on-surface-variant">
          {formatHolidayDate(holiday.date)}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            holiday.isObserved
              ? "text-error bg-error/10"
              : "text-on-surface-variant bg-surface-container-high"
          )}
        >
          {holiday.isObserved ? "Cerrado" : "Abierto"}
        </span>
        <input
          type="checkbox"
          checked={holiday.isObserved}
          onChange={() => toggleHoliday(holiday.key)}
          aria-label={`Cerrar por ${holiday.name}`}
          className="h-4 w-4 cursor-pointer accent-primary"
        />
      </span>
    </label>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2.5 tracking-tight">
            <CalendarDays className="w-5 h-5 text-primary shrink-0" strokeWidth={2.2} />
            <span>Festivos</span>
          </h3>
          {saveStatus === "saving" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Guardando...</span>
            </span>
          ) : saveStatus === "saved" ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Guardado</span>
            </span>
          ) : null}
        </div>
        <p className="text-body-sm text-on-surface-variant mt-0.5">
          Bloquean la agenda y el portal de reservas. Se guardan automáticamente al marcar.
        </p>
      </div>

      <div className="flex flex-col gap-4 pt-1">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Nacionales
              </span>
              {/* Diez festivos en una sola columna dejaban el horario con medio
                  panel en blanco al lado; repartidos en dos, las dos mitades de
                  la tarjeta acaban a la misma altura. */}
              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {nationals.map(renderRow)}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Autonómicos
              </span>
              <p className="text-[11px] text-on-surface-variant/80 mb-1">
                No se aplican por defecto: activa solo los que sean festivo en tu comunidad.
              </p>
              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {regionals.map(renderRow)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
