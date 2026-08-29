"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ProgressBar
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: "primary" | "error" | "warning";
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, variant = "primary", showLabel, label, ...props }, ref) => {
    const variantClasses = {
      primary: "bg-primary",
      error: "bg-error",
      warning: "bg-amber-500",
    };
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-label-sm font-medium text-on-surface-variant">{label}</span>
            <span className="text-label-sm font-mono font-semibold text-on-surface">
              {Math.round(value)}%
            </span>
          </div>
        )}
        <div className="h-1.5 w-full rounded-full bg-outline-variant/30 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantClasses[variant]
            )}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
