"use client";

import { ReactNode, useState } from "react";
import { Info, Triangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/volta-ui";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral" | "stable";
  caption?: string;
  infoText?: string;
  sparklineData?: number[];
  detailsLink?: string;
  onDetailsClick?: () => void;
  progress?: number;
  iconClassName?: string;
  className?: string;
}

function MiniSparkline({
  data = [],
  trend = "neutral",
}: {
  data?: number[];
  trend?: "up" | "down" | "neutral" | "stable";
}) {
  const strokeColor =
    trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#6366f1";

  // Use real data array or flat zero baseline
  const points = data && data.length >= 2 ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;

  const width = 56;
  const height = 22;
  const padding = 3;

  const coords = points.map((val, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const dPath = `M ${coords.join(" L ")}`;

  return (
    <svg className="w-14 h-7 overflow-visible select-none" viewBox={`0 0 ${width} ${height}`} fill="none">
      <path
        d={dPath}
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MetricCard({
  title,
  value,
  icon,
  change,
  trend = "neutral",
  caption = "Desde la última semana",
  infoText = "Métrica y resumen analítico del estado actual de tu negocio.",
  sparklineData,
  detailsLink,
  onDetailsClick,
  progress,
  iconClassName = "",
  className = "",
}: MetricCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const isUp = trend === "up";
  const isDown = trend === "down";

  const trendColor = isUp
    ? "text-emerald-600"
    : isDown
      ? "text-red-500"
      : "text-indigo-600";

  return (
    <Card
      className={cn(
        "relative p-5 flex flex-col justify-between bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md select-none",
        className
      )}
    >
      {/* Interactive Info Popover */}
      {showInfo && (
        <div className="absolute inset-x-3 top-3 z-30 bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              {title}
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-on-surface-variant/60 hover:text-on-surface p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            {infoText}
          </p>
        </div>
      )}

      {/* Top Header Row: Icon + Title & Info Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface font-medium text-body-sm">
          <div className={cn("text-on-surface-variant/80 shrink-0", iconClassName)}>{icon}</div>
          <span className="truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className={cn(
            "text-on-surface-variant/40 hover:text-on-surface-variant transition-colors p-0.5 rounded cursor-pointer",
            showInfo && "text-primary font-bold"
          )}
          title="Ver explicación de este indicador"
          aria-label="Información de indicador"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Row: Big Metric Value + Caption & Mini Sparkline Graph */}
      <div className="flex items-center justify-between my-3">
        <div>
          <div className="text-3xl font-bold tracking-tight text-on-surface">
            {value}
          </div>
          <span className="text-[11px] text-on-surface-variant/70 block mt-1 font-medium">
            {caption}
          </span>
        </div>

        {/* Right: Dynamic Sparkline Curve */}
        <div className="shrink-0 pl-2">
          <MiniSparkline data={sparklineData} trend={trend} />
        </div>
      </div>

      {/* Bottom Footer Row WITHOUT separation line */}
      <div className="flex items-center justify-between pt-1 mt-1">
        <button
          type="button"
          onClick={onDetailsClick}
          className="text-xs font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
        >
          Detalles
        </button>

        {change && (
          <div className={cn("flex items-center gap-1 text-xs font-bold", trendColor)}>
            <span>{change}</span>
            <Triangle
              className={cn(
                "w-2.5 h-2.5 fill-current transition-transform",
                isDown ? "rotate-180" : ""
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
