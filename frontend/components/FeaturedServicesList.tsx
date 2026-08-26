"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceShare {
  name: string;
  pct: number;
  count?: number;
}

export interface FeaturedServicesListProps {
  services: ServiceShare[];
  totalCount?: number;
  periodLabel?: string;
  className?: string;
}

export const FeaturedServicesList: React.FC<FeaturedServicesListProps> = ({
  services = [],
  totalCount,
  periodLabel = "Enero - Diciembre 2026",
  className = "",
}) => {
  // Sort services by percentage descending
  const sorted = [...services].sort((a, b) => (b.pct || 0) - (a.pct || 0));
  const topService = sorted[0];
  const activePct = topService?.pct && topService.pct > 0 ? topService.pct : 0;
  const displayTotal = totalCount !== undefined ? totalCount : 0;

  // Donut SVG circumference calculation (r = 64)
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeDashoffset = circumference - (circumference * activePct) / 100;

  return (
    <div className={cn("flex flex-col items-center justify-between h-full select-none text-center py-1", className)}>
      {/* Header Title & Subtitle */}
      <div className="flex flex-col items-center">
        <h3 className="font-bold text-lg sm:text-xl text-on-surface tracking-tight">
          Servicios Destacados
        </h3>
        <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5">
          {periodLabel}
        </p>
      </div>

      {/* Radial Donut Progress Ring Chart */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--color-surface-container-high)"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-60"
          />

          {/* Active Arc Segment */}
          {activePct > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="var(--color-primary)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center Inner Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-on-surface">
            {displayTotal.toLocaleString("es-ES")}
          </span>
          <span className="text-xs font-medium text-on-surface-variant/70 mt-0.5">
            Citas
          </span>
        </div>
      </div>

      {/* Bottom Footer Summary */}
      <div className="flex flex-col items-center gap-1">
        {topService && topService.count && topService.count > 0 ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <span>Servicio más demandado: {topService.name} ({topService.pct}%)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant/70">
            <span>Sin datos de citas para este período</span>
          </div>
        )}
        <p className="text-[11px] text-on-surface-variant/60 font-medium">
          Distribución de servicios solicitados
        </p>
      </div>
    </div>
  );
};

FeaturedServicesList.displayName = "FeaturedServicesList";
