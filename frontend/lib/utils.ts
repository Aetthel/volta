import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-lg",
        "text-display",
        "text-headline-lg",
        "text-headline-md",
        "text-headline-sm",
        "text-headline-lg-mobile",
        "text-title-lg",
        "text-title-md",
        "text-body-lg",
        "text-body-md",
        "text-body-sm",
        "text-label-lg",
        "text-label-md",
        "text-label-sm",
        "text-label-xs",
      ],
      "font-family": [
        "font-display",
        "font-title-lg",
        "font-title-md",
        "font-body-lg",
        "font-body-md",
        "font-body-sm",
        "font-label-lg",
        "font-label-md",
        "font-label-sm",
      ],
      "text-color": [
        "text-primary",
        "text-primary-container",
        "text-on-primary",
        "text-on-primary-container",
        "text-secondary",
        "text-secondary-container",
        "text-on-secondary",
        "text-on-secondary-container",
        "text-tertiary",
        "text-tertiary-container",
        "text-on-tertiary",
        "text-on-tertiary-container",
        "text-surface",
        "text-surface-dim",
        "text-surface-bright",
        "text-surface-container",
        "text-surface-container-low",
        "text-surface-container-lowest",
        "text-surface-container-high",
        "text-surface-container-highest",
        "text-on-surface",
        "text-on-surface-variant",
        "text-inverse-surface",
        "text-inverse-on-surface",
        "text-inverse-primary",
        "text-outline",
        "text-outline-variant",
        "text-error",
        "text-error-container",
        "text-on-error",
        "text-on-error-container",
      ],
      "bg-color": [
        "bg-primary",
        "bg-primary-container",
        "bg-on-primary",
        "bg-on-primary-container",
        "bg-secondary",
        "bg-secondary-container",
        "bg-on-secondary",
        "bg-on-secondary-container",
        "bg-tertiary",
        "bg-tertiary-container",
        "bg-on-tertiary",
        "bg-on-tertiary-container",
        "bg-surface",
        "bg-surface-dim",
        "bg-surface-bright",
        "bg-surface-container",
        "bg-surface-container-low",
        "bg-surface-container-lowest",
        "bg-surface-container-high",
        "bg-surface-container-highest",
        "bg-on-surface",
        "bg-on-surface-variant",
        "bg-error",
        "bg-error-container",
        "bg-on-error",
        "bg-on-error-container",
      ],
      "border-color": [
        "border-primary",
        "border-outline",
        "border-outline-variant",
        "border-error",
        "border-error-container",
        "border-surface-container",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convierte a número los importes que llegan de la API. Los campos Decimal de
 * Prisma pueden viajar como string, y concatenarlos en lugar de sumarlos
 * producía importes corruptos (0 + "20" === "020").
 */
export function toAmount(value: number | string | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Formatea un importe en euros con la convención española: "1.234,56 €". */
export function formatCurrency(value: number | string | null | undefined): string {
  return eurFormatter.format(toAmount(value));
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

export interface DateTimeParts {
  /** Fecha legible: "1 jul 2025". */
  date: string;
  /** Hora local: "12:00". Vacía si el valor no era una fecha real. */
  time: string;
}

/**
 * Parte una fecha en día/mes/año y hora para mostrarlas por separado.
 * Devuelve null si no hay valor, y deja pasar tal cual los textos que no son
 * fechas (la lista de clientes usa literales como "Hoy").
 */
export function formatDateTimeParts(value: string | Date | null | undefined): DateTimeParts | null {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: String(value), time: "" };
  }

  return { date: dateFormatter.format(parsed), time: timeFormatter.format(parsed) };
}
