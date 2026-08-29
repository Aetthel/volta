"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ComponentType<any>;
}

export const Select = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, icon: Icon, children, ...props }, ref) => {
    return (
      <div className="relative w-full group/select">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within/select:text-primary pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          ref={ref}
          className={cn(
            "block w-full bg-surface bg-none text-body-lg text-on-surface border border-outline rounded-sm focus:border-primary focus:border-2 focus:outline-none transition-all py-3 shadow-sm appearance-none cursor-pointer pr-10",
            Icon ? "pl-12" : "pl-4",
            className
          )}
          {...props}
        >
          {children}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within/select:text-primary z-10">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";
