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

/**
 * Formatea automáticamente un número de teléfono con espacios legibles
 * tanto para números españoles (3-2-2-2) como internacionales (+34 ...).
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return "";

  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  // Si empieza con + o con prefijo 34 largo (más de 9 dígitos)
  if (hasPlus || (digits.startsWith("34") && digits.length > 9)) {
    const isSpain = digits.startsWith("34");
    if (isSpain) {
      const rest = digits.slice(2);
      if (rest.length === 0) return "+34";
      if (rest.length <= 3) return `+34 ${rest}`;
      if (rest.length <= 5) return `+34 ${rest.slice(0, 3)} ${rest.slice(3)}`;
      if (rest.length <= 7) return `+34 ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
      return `+34 ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
    } else {
      // Otros prefijos internacionales
      if (digits.length <= 2) return `+${digits}`;
      if (digits.length <= 5) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 8) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
      if (digits.length <= 11) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)} ${digits.slice(11, 14)}`;
    }
  }

  // Formato español estándar (9 dígitos): 600 12 34 56
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;

  // Números más largos
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
}

