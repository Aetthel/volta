"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  className,
  size = "md",
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: "p-1 rounded-lg text-body-xs gap-1",
    md: "p-1 rounded-xl text-label-md gap-1",
    lg: "p-1.5 rounded-2xl text-body-md gap-1.5",
  };

  const itemSizeClasses = {
    sm: "py-1 px-2.5 gap-1.5 rounded-md",
    md: "py-1.5 px-3.5 gap-2 rounded-lg",
    lg: "py-2 px-4 gap-2.5 rounded-xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  };

  return (
    <div
      className={cn(
        "bg-surface-variant/60 p-1 rounded-xl select-none",
        fullWidth ? "flex w-full" : "inline-flex w-fit max-w-full",
        sizeClasses[size],
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-center transition-all duration-150 cursor-pointer border-none outline-none select-none shrink-0",
              fullWidth ? "flex-1" : "",
              itemSizeClasses[size],
              isSelected
                ? "bg-primary text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:text-on-surface font-medium hover:bg-surface-container-lowest/30"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  iconSizes[size],
                  isSelected ? "text-on-primary" : "text-on-surface-variant/60"
                )}
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
