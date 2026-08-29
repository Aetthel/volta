"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Save, Loader2, Sparkles } from "lucide-react";
import type { BusinessHours, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Skeleton,
} from "@/components/ui/volta-ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface BusinessHoursGridProps {
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export const BusinessHoursGrid: React.FC<BusinessHoursGridProps> = ({
  businessId,
  setToast,
}) => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

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

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);
    try {
      const res = await apiClient.business.updateHours<BusinessHours[]>(businessId, hours);
      if (res.error) throw new Error(res.error);

      if (res.data) setHours(res.data);
      setToast({ show: true, text: "¡Horario comercial guardado correctamente!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar horarios" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingHours(false);
    }
  };

  const applyMondayToWeekdays = () => {
    const monday = hours.find((h) => h.dayOfWeek === 1);
    if (!monday) return;

    setHours((prev) =>
      prev.map((h) => {
        if (h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
          return {
            ...h,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            isClosed: monday.isClosed,
          };
        }
        return h;
      })
    );
    setToast({ show: true, text: "Horario de lunes aplicado a todos los días laborables (L-V)" });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Horario de Apertura</span>
          </CardTitle>
          <button
            type="button"
            onClick={applyMondayToWeekdays}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
            title="Aplica el horario del lunes a martes, miércoles, jueves y viernes"
          >
            <Sparkles className="w-3 h-3" />
            <span>Copiar L-V</span>
          </button>
        </div>
        <CardDescription>
          Configura los días y turnos de atención comercial de tu salón.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSaveHours}>
        <CardContent className="flex flex-col gap-2.5 pt-1">
          {loadingHours ? (
            <div className="flex flex-col gap-3 py-2">
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
                          setHours(next);
                        }}
                        className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                      />
                      <span className="text-on-surface-variant/60 font-light">-</span>
                      <input
                        type="time"
                        value={h.closeTime || "20:00"}
                        onChange={(e) => {
                          const next = [...hours];
                          next[idx] = { ...next[idx], closeTime: e.target.value };
                          setHours(next);
                        }}
                        className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const next = [...hours];
                      next[idx] = { ...next[idx], isClosed: !next[idx].isClosed };
                      setHours(next);
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
        </CardContent>

        <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={savingHours || loadingHours}
            variant="default"
            size="md"
            className="flex items-center gap-2 font-medium"
          >
            {savingHours ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Horarios</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
