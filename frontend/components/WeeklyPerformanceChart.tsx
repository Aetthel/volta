"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WeeklyDataPoint {
  name: string;
  count: number;
  isCurrent: boolean;
}

export interface WeeklyPerformanceChartProps {
  data: WeeklyDataPoint[];
  maxCount: number;
}

export const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({
  data,
  maxCount,
}) => {
  return (
    <div className="flex flex-col mt-8">
      {/* Bounded Grid Area */}
      <div className="relative h-48 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner-sm">
        {/* Background Grid Pattern of Squares */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none opacity-85" />

        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-between px-6 sm:px-12 pb-0 pt-8">
          {data.map((d) => {
            const pct = (d.count / maxCount) * 100;
            return (
              <div key={d.name} className="relative w-8 sm:w-12 flex justify-center items-end h-full group z-10">
                <div
                  className={cn(
                    "w-full rounded-t-[3px] transition-all duration-500 cursor-pointer shadow-sm",
                    d.isCurrent
                      ? "bg-[#005d63] hover:bg-[#00474b]"
                      : "bg-[#b2f1e8]/50 hover:bg-[#92ebd9]"
                  )}
                  style={{ height: `${Math.max(8, pct)}%` }}
                  title={`${d.name}: ${d.count} citas`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels Row below the Grid Area */}
      <div className="flex justify-between px-6 sm:px-12 mt-3 select-none">
        {data.map((d) => (
          <span
            key={d.name}
            className={cn(
              "w-8 sm:w-12 text-center text-body-sm font-semibold transition-colors",
              d.isCurrent ? "text-[#005d63] font-bold" : "text-slate-400"
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
