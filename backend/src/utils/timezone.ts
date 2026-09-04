/**
 * Conversión entre la hora civil del negocio y el instante UTC que guarda la base
 * de datos.
 *
 * Hace falta para las clases semanales: una clase "los martes a las 11:30" se
 * programa una vez y se materializa durante meses, así que no vale con sumar
 * 7 × 24 h al primer instante —el cambio de hora de marzo y octubre desplazaría
 * media temporada de sesiones una hora—. Cada ocurrencia se recompone desde su
 * fecha civil (año/mes/día + "HH:MM") aplicando el desfase real de la zona en esa
 * fecha, que es lo que hace `Intl` sin dependencias.
 */

/** Zona del negocio. Volta es un producto español; se puede forzar por entorno. */
export const BUSINESS_TIME_ZONE = process.env.BUSINESS_TIME_ZONE || "Europe/Madrid";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
};

/** Desfase de la zona (en ms) en un instante concreto: UTC + offset = hora local. */
const getTimeZoneOffset = (timestamp: number, timeZone: string): number => {
  const parts = getFormatter(timeZone).formatToParts(new Date(timestamp));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  // Algunos motores devuelven "24" para la medianoche.
  const hour = read("hour") % 24;

  const asIfUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    hour,
    read("minute"),
    read("second")
  );

  return asIfUtc - Math.floor(timestamp / 1000) * 1000;
};

/**
 * Fecha y hora civiles de una zona -> instante UTC.
 *
 * El segundo pase absorbe los saltos de horario: el desfase se mide primero sobre
 * una estimación y se vuelve a medir sobre el instante ya corregido, que es el que
 * cae al otro lado del cambio de hora.
 */
export const zonedTimeToUtc = (
  year: number,
  month: number, // 1-12
  day: number,
  hours: number,
  minutes: number,
  timeZone: string = BUSINESS_TIME_ZONE
): Date => {
  const naive = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

  const firstOffset = getTimeZoneOffset(naive, timeZone);
  let timestamp = naive - firstOffset;

  const secondOffset = getTimeZoneOffset(timestamp, timeZone);
  if (secondOffset !== firstOffset) {
    timestamp = naive - secondOffset;
  }

  return new Date(timestamp);
};

export interface CivilDate {
  year: number;
  month: number; // 1-12
  day: number;
}

/** Instante UTC -> fecha civil en la zona del negocio. */
export const utcToCivilDate = (
  date: Date | string | number,
  timeZone: string = BUSINESS_TIME_ZONE
): CivilDate => {
  const parts = getFormatter(timeZone).formatToParts(new Date(date));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return { year: read("year"), month: read("month"), day: read("day") };
};

/** "YYYY-MM-DD" de una fecha civil, la misma clave que usa el catálogo de festivos. */
export const civilDateKey = ({ year, month, day }: CivilDate): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/**
 * Fecha civil como medianoche UTC.
 *
 * Es la forma en que se guardan `startDate`, `endDate` y `generatedUntil` de una
 * clase semanal: son días de calendario, no instantes, y anclarlos a UTC evita
 * que la zona del servidor los corra un día arriba o abajo al releerlos.
 */
export const civilDateToUtcMidnight = ({ year, month, day }: CivilDate): Date =>
  new Date(Date.UTC(year, month - 1, day));

/** Medianoche UTC -> fecha civil. Inverso exacto de `civilDateToUtcMidnight`. */
export const utcMidnightToCivilDate = (date: Date): CivilDate => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
  day: date.getUTCDate(),
});

/** Día de la semana según el convenio de `Date.getDay()`: 0 = domingo. */
export const civilDayOfWeek = ({ year, month, day }: CivilDate): number =>
  new Date(Date.UTC(year, month - 1, day)).getUTCDay();

/** Suma días de calendario sin que el cambio de hora altere el resultado. */
export const addCivilDays = (date: CivilDate, days: number): CivilDate => {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return utcMidnightToCivilDate(shifted);
};

/** Orden natural entre fechas civiles: <0, 0 o >0. */
export const compareCivilDates = (a: CivilDate, b: CivilDate): number =>
  civilDateKey(a).localeCompare(civilDateKey(b));

/** "YYYY-MM-DD" -> fecha civil. Devuelve null si el formato no cuadra. */
export const parseCivilDate = (value: string): CivilDate | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const civil = { year: Number(year), month: Number(month), day: Number(day) };

  // Rechaza fechas imposibles ("2026-02-31") comprobando el viaje de ida y vuelta.
  const roundTrip = utcMidnightToCivilDate(civilDateToUtcMidnight(civil));
  return compareCivilDates(civil, roundTrip) === 0 ? civil : null;
};

/** Hoy en la zona del negocio. */
export const todayCivilDate = (timeZone: string = BUSINESS_TIME_ZONE): CivilDate =>
  utcToCivilDate(new Date(), timeZone);

/** "HH:MM" -> { hours, minutes }. Null si no es una hora válida. */
export const parseTimeOfDay = (value: string): { hours: number; minutes: number } | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
};

export default {
  BUSINESS_TIME_ZONE,
  zonedTimeToUtc,
  utcToCivilDate,
  civilDateKey,
  civilDateToUtcMidnight,
  utcMidnightToCivilDate,
  civilDayOfWeek,
  addCivilDays,
  compareCivilDates,
  parseCivilDate,
  todayCivilDate,
  parseTimeOfDay,
};
