"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayPickerProps } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

/**
 * Calendario de shadcn/ui sobre react-day-picker v10.
 *
 * Se aparta del snippet original de shadcn en dos puntos, a propósito:
 * - Los colores usan los tokens Material del proyecto (surface-container / on-surface
 *   / primary) en vez de los de shadcn (bg-accent, text-muted-foreground), que no
 *   están definidos como utilidades en globals.css.
 * - El locale por defecto es `es` con la semana empezando en lunes, que es lo que
 *   espera el resto de la app (la agenda y CalendarSelect ya lo hacían).
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es,
  weekStartsOn = 1,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      weekStartsOn={weekStartsOn}
      className={cn("p-3", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: "flex flex-col sm:flex-row gap-4 relative",
        month: "flex flex-col gap-3",

        // La barra de navegación se superpone al caption para que el mes quede
        // centrado entre las dos flechas.
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-7 z-10",
        button_previous: cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-lg",
          "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/70",
          "transition-colors cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none"
        ),
        button_next: cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-lg",
          "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/70",
          "transition-colors cursor-pointer select-none",
          "disabled:opacity-40 disabled:pointer-events-none"
        ),

        month_caption: "flex items-center justify-center h-7",
        caption_label: "text-sm font-semibold text-on-surface capitalize",

        dropdowns: "flex items-center justify-center gap-1.5",
        dropdown_root: "relative",
        dropdown:
          "bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-sm text-on-surface px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20",

        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-8 text-[11px] font-medium text-on-surface-variant/70 capitalize select-none",
        weeks: "w-full",
        week: "flex w-full mt-1",

        day: cn(
          "relative w-8 h-8 p-0 text-center",
          // Redondea los extremos cuando se usa mode="range".
          "[&:has(.range-start)]:rounded-l-lg [&:has(.range-end)]:rounded-r-lg"
        ),
        day_button: cn(
          "w-8 h-8 inline-flex items-center justify-center rounded-lg",
          "text-sm font-normal text-on-surface",
          "hover:bg-surface-container-high/70 transition-colors cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:pointer-events-none"
        ),

        selected:
          "[&>button]:bg-primary [&>button]:text-on-surface [&>button]:font-semibold [&>button]:hover:bg-primary [&>button]:shadow-sm",
        // El día de hoy también puede estar seleccionado. Sin excluir ese caso,
        // `text-primary` y el `text-*` de `selected` empatan en especificidad y
        // gana el orden del CSS: el número salía del mismo verde que el fondo y
        // desaparecía. Acotarlo deja que `selected` mande cuando coinciden.
        today: cn(
          "[&:not([data-selected=true])>button]:font-bold",
          "[&:not([data-selected=true])>button]:text-primary",
          "[&:not([data-selected=true])>button]:ring-1",
          "[&:not([data-selected=true])>button]:ring-inset",
          "[&:not([data-selected=true])>button]:ring-primary/40"
        ),
        outside: "[&>button]:text-on-surface-variant/35",
        disabled: "[&>button]:text-on-surface-variant/30 [&>button]:line-through",
        hidden: "invisible",

        range_start: "range-start [&>button]:rounded-r-none",
        range_end: "range-end [&>button]:rounded-l-none",
        range_middle:
          "bg-primary/10 [&>button]:bg-transparent [&>button]:text-on-surface [&>button]:rounded-none",

        week_number_header: "w-8",
        week_number: "w-8 text-[11px] text-on-surface-variant/60",

        footer: "pt-2 text-xs text-on-surface-variant",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("w-4 h-4", chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
