import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
