"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingInput } from "./floating-input";

export interface CalendarSelectProps {
  id: string;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  variant?: "outlined" | "minimal" | "borderless";
  className?: string;
}

export const CalendarSelect: React.FC<CalendarSelectProps> = ({
  id,
  value,
  onChange,
  variant = "borderless",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [openUpward, setOpenUpward] = React.useState(false);
  const [alignRight, setAlignRight] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewDate, setViewDate] = React.useState(currentDate);

  React.useEffect(() => {
    if (value) {
      setViewDate(new Date(value + "T00:00:00"));
    }
  }, [value]);

  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 310;
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }

      if (rect.left + 288 > window.innerWidth && rect.right - 288 > 0) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "Seleccionar fecha";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <FloatingInput
          id={`${id}-trigger`}
          label=""
          type="text"
          readOnly
          value={formatDateLabel(value)}
          onClick={() => setIsOpen(!isOpen)}
          className={cn("cursor-pointer text-body-lg font-normal", className)}
          variant={variant}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "absolute bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-50 p-4 w-72 flex flex-col gap-3 select-none",
              openUpward ? "bottom-full mb-1" : "top-full mt-1",
              alignRight ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-on-surface/[0.04] rounded-lg text-on-surface cursor-pointer select-none font-semibold"
              >
                &larr;
              </button>
              <span className="text-body-md font-semibold text-on-surface">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-on-surface/[0.04] rounded-lg text-on-surface cursor-pointer select-none font-semibold"
              >
                &rarr;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-body-xs font-semibold text-on-surface-variant/60">
              <span>Lu</span>
              <span>Ma</span>
              <span>Mi</span>
              <span>Ju</span>
              <span>Vi</span>
              <span>Sá</span>
              <span>Do</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />;
                }
                const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = dateString === value;
                const isToday = new Date().toISOString().split("T")[0] === dateString;

                return (
                  <button
                    key={dateString}
                    type="button"
                    onClick={() => {
                      onChange(dateString);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-medium cursor-pointer transition-colors select-none",
                      isSelected
                        ? "bg-primary text-on-primary font-bold"
                        : isToday
                          ? "border border-primary text-primary"
                          : "text-on-surface hover:bg-on-surface/[0.06]"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
CalendarSelect.displayName = "CalendarSelect";
