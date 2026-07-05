"use client";

import * as React from "react";
import { Scissors } from "lucide-react";

export interface ServiceShare {
  name: string;
  pct: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FeaturedServicesListProps {
  services: ServiceShare[];
}

export const FeaturedServicesList: React.FC<FeaturedServicesListProps> = ({
  services,
}) => {
  return (
    <div className="flex flex-col gap-6 justify-center flex-1">
      {services.map((s, idx) => {
        const icons = [Scissors, Scissors, Scissors, Scissors];
        const Icon = s.icon || icons[idx % icons.length];
        return (
          <div key={s.name} className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-body-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#005d63]" />
                <span>{s.name}</span>
              </div>
              <span className="text-slate-400 font-medium">{s.pct}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#005d63] h-full rounded-full transition-all duration-500"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
FeaturedServicesList.displayName = "FeaturedServicesList";
