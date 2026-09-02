/**
 * Festivos españoles.
 */

export interface BaseHoliday {
  key: string;
  name: string;
  month?: number;
  day?: number;
  easterOffset?: number;
  note?: string;
}

export interface CatalogHoliday extends BaseHoliday {
  scope: "NATIONAL" | "REGIONAL";
}

export interface BusinessHolidayPreference {
  holidayKey: string;
  isObserved: boolean;
}

export interface ObservedHolidayResult {
  date: string;
  key: string;
  name: string;
  scope: "NATIONAL" | "REGIONAL";
}

export interface HolidayCheckResult {
  isHoliday: boolean;
  name?: string;
  key?: string;
}

export interface HolidayCatalogueItem {
  key: string;
  name: string;
  scope: "NATIONAL" | "REGIONAL";
  note: string | null;
  date: string;
  isObserved: boolean;
  isDefault: boolean;
}

/**
 * Domingo de Pascua por el algoritmo de Meeus/Jones/Butcher (calendario
 * gregoriano). De él cuelgan Jueves Santo, Viernes Santo y Lunes de Pascua.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = marzo, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/** Fecha desplazada en días, en hora local. */
const shiftDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
};

/** "YYYY-MM-DD" en hora local: usar toISOString() correría un día según el huso. */
export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Festivos nacionales: se observan salvo que el negocio diga lo contrario. */
export const NATIONAL_HOLIDAYS: BaseHoliday[] = [
  { key: "ANO_NUEVO", name: "Año Nuevo", month: 1, day: 1 },
  { key: "EPIFANIA", name: "Epifanía del Señor (Reyes)", month: 1, day: 6 },
  { key: "VIERNES_SANTO", name: "Viernes Santo", easterOffset: -2 },
  { key: "FIESTA_TRABAJO", name: "Fiesta del Trabajo", month: 5, day: 1 },
  { key: "ASUNCION", name: "Asunción de la Virgen", month: 8, day: 15 },
  { key: "FIESTA_NACIONAL", name: "Fiesta Nacional de España", month: 10, day: 12 },
  { key: "TODOS_LOS_SANTOS", name: "Todos los Santos", month: 11, day: 1 },
  { key: "CONSTITUCION", name: "Día de la Constitución", month: 12, day: 6 },
  { key: "INMACULADA", name: "Inmaculada Concepción", month: 12, day: 8 },
  { key: "NAVIDAD", name: "Navidad", month: 12, day: 25 },
];

/** Festivos autonómicos: solo se observan si el negocio los activa. */
export const REGIONAL_HOLIDAYS: BaseHoliday[] = [
  {
    key: "JUEVES_SANTO",
    name: "Jueves Santo",
    easterOffset: -3,
    note: "Festivo en casi toda España, salvo Cataluña y la Comunidad Valenciana.",
  },
  {
    key: "LUNES_PASCUA",
    name: "Lunes de Pascua",
    easterOffset: 1,
    note: "Cataluña, Comunidad Valenciana, Baleares, Navarra, País Vasco y La Rioja.",
  },
  {
    key: "SAN_JUAN",
    name: "San Juan",
    month: 6,
    day: 24,
    note: "Cataluña, Comunidad Valenciana, Galicia y Baleares.",
  },
  {
    key: "SAN_ESTEBAN",
    name: "San Esteban",
    month: 12,
    day: 26,
    note: "Cataluña y Baleares.",
  },
];

export const ALL_HOLIDAYS: CatalogHoliday[] = [
  ...NATIONAL_HOLIDAYS.map((h) => ({ ...h, scope: "NATIONAL" as const })),
  ...REGIONAL_HOLIDAYS.map((h) => ({ ...h, scope: "REGIONAL" as const })),
];

const HOLIDAYS_BY_KEY = new Map<string, CatalogHoliday>(ALL_HOLIDAYS.map((h) => [h.key, h]));

export const isKnownHolidayKey = (key: string): boolean => HOLIDAYS_BY_KEY.has(key);

/** Fecha concreta que ocupa un festivo del catálogo en un año dado. */
const resolveHolidayDate = (holiday: CatalogHoliday, year: number): Date => {
  if (typeof holiday.easterOffset === "number") {
    return shiftDays(getEasterSunday(year), holiday.easterOffset);
  }
  return new Date(year, (holiday.month ?? 1) - 1, holiday.day ?? 1);
};

const isObserved = (holiday: CatalogHoliday, preferences: Map<string, boolean>): boolean => {
  const stored = preferences.get(holiday.key);
  if (stored !== undefined) return stored;
  return holiday.scope === "NATIONAL";
};

export function getObservedHolidays(
  businessPreferences?: BusinessHolidayPreference[] | null,
  fromYear = new Date().getFullYear(),
  toYear = fromYear
): ObservedHolidayResult[] {
  const preferences = new Map<string, boolean>(
    (businessPreferences || []).map((p) => [p.holidayKey, p.isObserved])
  );

  const result: ObservedHolidayResult[] = [];

  for (let year = fromYear; year <= toYear; year++) {
    for (const holiday of ALL_HOLIDAYS) {
      if (!isObserved(holiday, preferences)) continue;

      result.push({
        date: toDateKey(resolveHolidayDate(holiday, year)),
        key: holiday.key,
        name: holiday.name,
        scope: holiday.scope,
      });
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function getHolidayForDate(
  businessPreferences: BusinessHolidayPreference[] | null | undefined,
  date: Date | string
): HolidayCheckResult {
  const target = date instanceof Date ? date : new Date(date);
  if (isNaN(target.getTime())) return { isHoliday: false };

  const preferences = new Map<string, boolean>(
    (businessPreferences || []).map((p) => [p.holidayKey, p.isObserved])
  );
  const year = target.getFullYear();
  const targetKey = toDateKey(target);

  for (const holiday of ALL_HOLIDAYS) {
    if (!isObserved(holiday, preferences)) continue;
    if (toDateKey(resolveHolidayDate(holiday, year)) === targetKey) {
      return { isHoliday: true, name: holiday.name, key: holiday.key };
    }
  }

  return { isHoliday: false };
}

export function getHolidayCatalogue(
  businessPreferences: BusinessHolidayPreference[] | null | undefined,
  year: number
): HolidayCatalogueItem[] {
  const preferences = new Map<string, boolean>(
    (businessPreferences || []).map((p) => [p.holidayKey, p.isObserved])
  );

  return ALL_HOLIDAYS.map((holiday) => ({
    key: holiday.key,
    name: holiday.name,
    scope: holiday.scope,
    note: holiday.note || null,
    date: toDateKey(resolveHolidayDate(holiday, year)),
    isObserved: isObserved(holiday, preferences),
    isDefault: preferences.get(holiday.key) === undefined,
  }));
}

export default {
  getEasterSunday,
  toDateKey,
  NATIONAL_HOLIDAYS,
  REGIONAL_HOLIDAYS,
  ALL_HOLIDAYS,
  isKnownHolidayKey,
  getObservedHolidays,
  getHolidayForDate,
  getHolidayCatalogue,
};
