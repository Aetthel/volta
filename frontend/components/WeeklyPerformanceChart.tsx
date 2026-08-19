"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WeeklyDataPoint {
  name: string;
  income: number;
  clients: number;
  isCurrent: boolean;
}

export interface WeeklyPerformanceChartProps {
  data: WeeklyDataPoint[];
}

function buildCurvedPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return path;
}

export const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({
  data = [],
}) => {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 12;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  const maxIncome = Math.max(...data.map((d) => d.income || 0), 100);
  const maxClients = Math.max(...data.map((d) => d.clients || 0), 5);

  const incomePoints = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.income || 0) / maxIncome) * chartHeight;
    return { x, y, val: d.income || 0, name: d.name };
  });

  const clientsPoints = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.clients || 0) / maxClients) * chartHeight;
    return { x, y, val: d.clients || 0, name: d.name };
  });

  const incomeLine = buildCurvedPath(incomePoints);
  const clientsLine = buildCurvedPath(clientsPoints);

  const incomeArea = incomePoints.length
    ? `${incomeLine} L ${incomePoints[incomePoints.length - 1].x},${svgHeight - paddingBottom} L ${incomePoints[0].x},${svgHeight - paddingBottom} Z`
    : "";

  const clientsArea = clientsPoints.length
    ? `${clientsLine} L ${clientsPoints[clientsPoints.length - 1].x},${svgHeight - paddingBottom} L ${clientsPoints[0].x},${svgHeight - paddingBottom} Z`
    : "";

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Legend Header with Subtitle matching exact screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg sm:text-xl text-on-surface tracking-tight">
            Rendimiento de Actividad
          </h3>
          <p className="text-xs text-on-surface-variant/60 mt-0.5 font-medium">
            Comparativa semanal de ingresos (€) y clientes atendidos
          </p>
        </div>

        {/* Color Legend Badges */}
        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
            <span className="text-on-surface-variant/80">Ingresos (€)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
            <span className="text-on-surface-variant/80">Clientes</span>
          </div>
        </div>
      </div>

      {/* Edge-to-Edge SVG Curved Area Chart Container without inner border box */}
      <div className="relative w-full h-[200px] overflow-hidden my-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Coral/Orange Linear Gradient for Income Area */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.0" />
            </linearGradient>

            {/* Soft Teal/Emerald Linear Gradient for Clients Area */}
            <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Clean Horizontal Grid Lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * pct;
            return (
              <line
                key={idx}
                x1={0}
                y1={y}
                x2={svgWidth}
                y2={y}
                stroke="var(--color-outline-variant)"
                strokeOpacity="0.2"
                strokeDasharray="0"
              />
            );
          })}

          {/* Income Gradient Fill Area & Smooth Line */}
          {incomeArea && <path d={incomeArea} fill="url(#incomeGradient)" />}
          {incomeLine && (
            <path
              d={incomeLine}
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Clients Gradient Fill Area & Smooth Line */}
          {clientsArea && <path d={clientsArea} fill="url(#clientsGradient)" />}
          {clientsLine && (
            <path
              d={clientsLine}
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Nodes (only shown on hover) */}
          {data.map((d, i) => {
            const ip = incomePoints[i];
            const cp = clientsPoints[i];
            if (!ip || !cp) return null;
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.name} className="cursor-pointer">
                {/* Vertical hover guide line */}
                {isHovered && (
                  <>
                    <line
                      x1={ip.x}
                      y1={paddingTop}
                      x2={ip.x}
                      y2={svgHeight - paddingBottom}
                      stroke="#9ca3af"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.5"
                    />
                    <circle
                      cx={ip.x}
                      cy={ip.y}
                      r="4.5"
                      fill="#f87171"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="4.5"
                      fill="#2dd4bf"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Transparent Hitbox for Hover */}
                <rect
                  x={ip.x - 25}
                  y={0}
                  width="50"
                  height={svgHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredIdx !== null && incomePoints[hoveredIdx] && clientsPoints[hoveredIdx] && (
          <div
            className="absolute z-30 bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-3 shadow-xl pointer-events-none text-xs flex flex-col gap-1 -translate-x-1/2 -translate-y-full mb-2 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(incomePoints[hoveredIdx].x / svgWidth) * 100}%`,
              top: `${(Math.min(incomePoints[hoveredIdx].y, clientsPoints[hoveredIdx].y) / svgHeight) * 100}%`,
            }}
          >
            <span className="font-bold text-on-surface border-b border-outline-variant/20 pb-1">
              {data[hoveredIdx].name}
              {data[hoveredIdx].isCurrent ? " (Hoy)" : ""}
            </span>
            <div className="flex items-center gap-2 text-rose-600 font-semibold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              <span>Ingresos: {data[hoveredIdx].income} €</span>
            </div>
            <div className="flex items-center gap-2 text-teal-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
              <span>Clientes: {data[hoveredIdx].clients}</span>
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Day Labels Edge-to-Edge */}
      <div className="flex justify-between px-2 select-none">
        {data.map((d) => (
          <span
            key={d.name}
            className={cn(
              "text-center text-xs font-semibold transition-colors",
              d.isCurrent ? "text-primary font-bold" : "text-on-surface-variant/50"
            )}
          >
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
};
WeeklyPerformanceChart.displayName = "WeeklyPerformanceChart";
