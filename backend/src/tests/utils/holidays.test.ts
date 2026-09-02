import { describe, test, expect } from "vitest";
import {
  getEasterSunday,
  getObservedHolidays,
  getHolidayForDate,
  getHolidayCatalogue,
  toDateKey,
  isKnownHolidayKey,
} from "../../utils/holidays.js";

describe("Festivos españoles", () => {
  describe("getEasterSunday", () => {
    // Fechas reales del Domingo de Pascua, para fijar el algoritmo.
    test.each([
      [2024, "2024-03-31"],
      [2025, "2025-04-20"],
      [2026, "2026-04-05"],
      [2027, "2027-03-28"],
      [2030, "2030-04-21"],
      [2038, "2038-04-25"], // Año con la Pascua más tardía posible.
    ])("calcula la Pascua de %i", (year, expected) => {
      expect(toDateKey(getEasterSunday(year))).toBe(expected);
    });
  });

  describe("getObservedHolidays", () => {
    test("aplica los festivos nacionales sin necesidad de configurar nada", () => {
      const holidays = getObservedHolidays([], 2026, 2026);
      const dates = holidays.map((h) => h.date);

      expect(dates).toContain("2026-01-01"); // Año Nuevo
      expect(dates).toContain("2026-01-06"); // Reyes
      expect(dates).toContain("2026-10-12"); // Fiesta Nacional
      expect(dates).toContain("2026-12-08"); // Inmaculada
      expect(dates).toContain("2026-12-25"); // Navidad
    });

    test("incluye el Viernes Santo, que depende de la Pascua", () => {
      // Pascua 2026: domingo 5 de abril, así que el Viernes Santo es el 3.
      const holidays = getObservedHolidays([], 2026, 2026);
      const viernesSanto = holidays.find((h) => h.key === "VIERNES_SANTO");

      expect(viernesSanto).toBeDefined();
      expect(viernesSanto?.date).toBe("2026-04-03");
    });

    test("no aplica los autonómicos mientras el negocio no los active", () => {
      const holidays = getObservedHolidays([], 2026, 2026);

      expect(holidays.find((h) => h.key === "SAN_JUAN")).toBeUndefined();
      expect(holidays.find((h) => h.key === "JUEVES_SANTO")).toBeUndefined();
    });

    test("aplica un autonómico cuando el negocio lo activa", () => {
      const holidays = getObservedHolidays(
        [{ holidayKey: "SAN_JUAN", isObserved: true }] as any,
        2026,
        2026
      );
      const sanJuan = holidays.find((h) => h.key === "SAN_JUAN");

      expect(sanJuan).toBeDefined();
      expect(sanJuan?.date).toBe("2026-06-24");
    });

    test("deja de aplicar un nacional si el negocio decide abrir ese día", () => {
      const holidays = getObservedHolidays(
        [{ holidayKey: "FIESTA_NACIONAL", isObserved: false }] as any,
        2026,
        2026
      );

      expect(holidays.find((h) => h.key === "FIESTA_NACIONAL")).toBeUndefined();
      // El resto de nacionales siguen intactos.
      expect(holidays.find((h) => h.key === "NAVIDAD")).toBeDefined();
    });

    test("cubre varios años y devuelve las fechas ordenadas", () => {
      const holidays = getObservedHolidays([], 2026, 2027);
      const dates = holidays.map((h) => h.date);

      expect(dates).toContain("2026-12-25");
      expect(dates).toContain("2027-12-25");
      expect([...dates]).toEqual([...dates].sort());
    });
  });

  describe("getHolidayForDate", () => {
    test("reconoce un festivo nacional y lo nombra", () => {
      const result = getHolidayForDate([], new Date(2026, 11, 25));

      expect(result.isHoliday).toBe(true);
      expect(result.name).toBe("Navidad");
      expect(result.key).toBe("NAVIDAD");
    });

    test("un día normal no es festivo", () => {
      expect(getHolidayForDate([], new Date(2026, 8, 2)).isHoliday).toBe(false);
    });

    test("San Juan solo es festivo para quien lo ha activado", () => {
      const sanJuan = new Date(2026, 5, 24);

      expect(getHolidayForDate([], sanJuan).isHoliday).toBe(false);
      expect(
        getHolidayForDate([{ holidayKey: "SAN_JUAN", isObserved: true }] as any, sanJuan).isHoliday
      ).toBe(true);
    });

    test("respeta que el negocio abra en un festivo nacional", () => {
      const result = getHolidayForDate(
        [{ holidayKey: "NAVIDAD", isObserved: false }] as any,
        new Date(2026, 11, 25)
      );

      expect(result.isHoliday).toBe(false);
    });

    test("no se rompe con una fecha inválida", () => {
      expect(getHolidayForDate([], new Date("no-es-una-fecha")).isHoliday).toBe(false);
    });
  });

  describe("getHolidayCatalogue", () => {
    test("lista todos los festivos con su fecha y si se observan", () => {
      const catalogue = getHolidayCatalogue([], 2026);

      const navidad = catalogue.find((h) => h.key === "NAVIDAD");
      expect(navidad).toMatchObject({
        date: "2026-12-25",
        scope: "NATIONAL",
        isObserved: true,
        isDefault: true,
      });

      const sanJuan = catalogue.find((h) => h.key === "SAN_JUAN");
      expect(sanJuan).toMatchObject({
        date: "2026-06-24",
        scope: "REGIONAL",
        isObserved: false,
        isDefault: true,
      });
      expect(sanJuan?.note).toContain("Cataluña");
    });

    test("marca como no predeterminado lo que el negocio ha decidido", () => {
      const catalogue = getHolidayCatalogue(
        [{ holidayKey: "SAN_JUAN", isObserved: true }] as any,
        2026
      );
      const sanJuan = catalogue.find((h) => h.key === "SAN_JUAN");

      expect(sanJuan?.isObserved).toBe(true);
      expect(sanJuan?.isDefault).toBe(false);
    });
  });

  describe("isKnownHolidayKey", () => {
    test("acepta claves del catálogo y rechaza inventadas", () => {
      expect(isKnownHolidayKey("NAVIDAD")).toBe(true);
      expect(isKnownHolidayKey("SAN_JUAN")).toBe(true);
      expect(isKnownHolidayKey("DIA_DEL_PIRATA")).toBe(false);
    });
  });
});
