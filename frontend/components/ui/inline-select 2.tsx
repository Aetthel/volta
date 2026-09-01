"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingInput } from "./floating-input";

const DROPDOWN_MAX_HEIGHT = 240;
const DROPDOWN_MIN_HEIGHT = 140;
const DROPDOWN_VIEWPORT_MARGIN = 16;

export interface InlineSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface InlineSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: InlineSelectOption[];
  variant?: "outlined" | "minimal" | "borderless";
  size?: "md" | "sm";
  className?: string;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  variant = "borderless",
  size = "md",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [maxHeight, setMaxHeight] = React.useState(DROPDOWN_MAX_HEIGHT);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find((o) => o.value === value);

  const displayValue = selectedOption
    ? selectedOption.sublabel
      ? `${selectedOption.label} — ${selectedOption.sublabel}`
      : selectedOption.label
    : "";

  React.useLayoutEffect(() => {
    if (!isOpen) return;

    const updateMaxHeight = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_VIEWPORT_MARGIN;
      setMaxHeight(Math.max(0, Math.min(DROPDOWN_MAX_HEIGHT, Math.round(spaceBelow))));
    };

    updateMaxHeight();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_VIEWPORT_MARGIN;
      if (spaceBelow < DROPDOWN_MIN_HEIGHT) {
        dropdownRef.current?.scrollIntoView({ block: "nearest" });
        requestAnimationFrame(updateMaxHeight);
      }
    }

    window.addEventListener("resize", updateMaxHeight);
    window.addEventListener("scroll", updateMaxHeight, true);
    return () => {
      window.removeEventListener("resize", updateMaxHeight);
      window.removeEventListener("scroll", updateMaxHeight, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative w-full", size === "sm" ? className : "")}>
      <div className="relative">
        {size === "sm" ? (
          <button
            id={`${id}-trigger`}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-8 w-full items-center justify-between bg-surface bg-none text-label-md text-on-surface border border-outline rounded-lg focus:border-primary focus:border-2 focus:outline-none transition-all py-1 px-4 cursor-pointer pr-10 text-left select-none"
          >
            <span className="truncate">{displayValue || label}</span>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </button>
        ) : (
          <>
            <FloatingInput
              id={`${id}-trigger`}
              label={label}
              type="text"
              readOnly
              value={displayValue}
              onClick={() => setIsOpen(!isOpen)}
              className={cn("cursor-pointer text-body-lg font-normal", className)}
              variant={variant}
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            ref={dropdownRef}
            style={{ maxHeight }}
            className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-y-auto overscroll-contain z-50 p-2 flex flex-col gap-1"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full text-left p-3 hover:bg-on-surface/[0.04] rounded-lg transition-colors text-body-lg text-on-surface font-normal cursor-pointer"
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-on-surface-variant text-body-sm font-normal">
                    {opt.sublabel}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
InlineSelect.displayName = "InlineSelect";
