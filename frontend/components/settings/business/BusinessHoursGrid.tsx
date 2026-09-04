"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Loader2, Sparkles, Check } from "lucide-react";
import type { BusinessHours } from "@/types/settings";
import { Skeleton, toast } from "@/components/ui/volta-ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface BusinessHoursGridProps {
  businessId: string;
}

export const BusinessHoursGrid: React.FC<BusinessHoursGridProps> = ({ businessId }) => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHours = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") return;
    setLoadingHours(true);
    try {
      const res = await apiClient.business.getHours<BusinessHours[]>(businessId);
      if (Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => {
          const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
          const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
          return dayA - dayB;
        });
        setHours(sorted);
      }
    } finally {
      setLoadingHours(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  const persistHours = useCallback(
    async (nextHours: BusinessHours[]) => {
      if (!businessId || businessId === "mock-business-id") return;
      setSaveStatus("saving");
      try {
        const res = await apiClient.business.updateHours<BusinessHours[]>(businessId, nextHours);
        if (res.error) throw new Error(res.error);
        if (res.data) setHours(res.data);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("idle");
        toast.error("Error al guardar horarios");
      }
    },
    [businessId]
  );

  const schedulePersistHours = (nextHours: BusinessHours[], delay = 400) => {
    setHours(nextHours);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (delay === 0) {
      persistHours(nextHours);
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        persistHours(nextHours);
      }, delay);
    }
  };

  const applyMondayToWeekdays = () => {
    const monday = hours.find((h) => h.dayOfWeek === 1);
    if (!monday) return;

    const next = hours.map((h) => {
      if (h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
        return {
          ...h,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          isClosed: monday.isClosed,
        };
      }
      return h;
    });

    schedulePersistHours(next, 0);
    toast.success("Horario de lunes aplicado a días laborables (L-V)");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2.5 tracking-tight">
            <Clock className="w-5 h-5 text-primary shrink-0" strokeWidth={2.2} />
            <span>Horario de Apertura</span>
          </h3>
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={applyMondayToWeekdays}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 shrink-0"
              title="Aplica el horario del lunes a martes, miércoles, jueves y viernes"
            >
              <Sparkles className="w-3 h-3" />
              <span>Copiar L-V</span>
            </button>
          </div>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-0.5">
          Los días y turnos de atención, de lunes a domingo. Los cambios se guardan solos.
        </p>
      </div>

      {/* `flex-1` + `justify-between`: los siete días se reparten la altura que
          marca la columna de festivos, en vez de amontonarse arriba y dejar un
          hueco muerto al final del panel. */}
      <div className="flex flex-1 flex-col justify-between gap-2.5 pt-1">
        {loadingHours ? (
          <div className="flex flex-1 flex-col justify-between gap-3 py-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        ) : (
          hours.map((h, idx) => (
            <div
              key={h.dayOfWeek}
              className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/30 last:border-0"
            >
              <span className="text-xs font-semibold text-on-surface w-24">
                {DAY_NAMES[h.dayOfWeek]}
              </span>

              <div className="flex items-center gap-2 flex-1 justify-end">
                {h.isClosed ? (
                  <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-0.5 rounded-full">
                    Cerrado
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs">
                    <input
                      type="time"
                      value={h.openTime || "09:00"}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx] = { ...next[idx], openTime: e.target.value };
                        schedulePersistHours(next, 400);
                      }}
                      onBlur={() => persistHours(hours)}
                      className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                    <span className="text-on-surface-variant/60 font-light">-</span>
                    <input
                      type="time"
                      value={h.closeTime || "20:00"}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx] = { ...next[idx], closeTime: e.target.value };
                        schedulePersistHours(next, 400);
                      }}
                      onBlur={() => persistHours(hours)}
                      className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const next = [...hours];
                    next[idx] = { ...next[idx], isClosed: !next[idx].isClosed };
                    schedulePersistHours(next, 0);
                  }}
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ml-1",
                    h.isClosed
                      ? "text-primary border-primary/30 hover:bg-primary/10"
                      : "text-on-surface-variant/70 border-outline-variant hover:bg-surface-container"
                  )}
                >
                  {h.isClosed ? "Abrir" : "Cerrar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
