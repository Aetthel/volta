import { describe, test, expect } from "vitest";
import {
  addCivilDays,
  civilDateKey,
  civilDateToUtcMidnight,
  civilDayOfWeek,
  compareCivilDates,
  parseCivilDate,
  parseTimeOfDay,
  utcMidnightToCivilDate,
  utcToCivilDate,
  zonedTimeToUtc,
} from "../../utils/timezone.js";

describe("Hora civil del negocio", () => {
  describe("zonedTimeToUtc", () => {
    // El motivo de todo el módulo: una clase semanal se materializa durante meses
    // y debe seguir cayendo a las 11:30 locales a los dos lados del cambio de hora.
    test("mantiene la hora local en horario de invierno", () => {
      // Madrid en invierno es UTC+1.
      expect(zonedTimeToUtc(2026, 1, 13, 11, 30, "Europe/Madrid").toISOString()).toBe(
        "2026-01-13T10:30:00.000Z"
      );
    });

    test("mantiene la hora local en horario de verano", () => {
      // Madrid en verano es UTC+2: el mismo "11:30" es otro instante UTC.
      expect(zonedTimeToUtc(2026, 7, 14, 11, 30, "Europe/Madrid").toISOString()).toBe(
        "2026-07-14T09:30:00.000Z"
      );
    });

    test("las clases de dos semanas consecutivas cruzan el cambio de hora sin desplazarse", () => {
      // En 2026 los relojes se adelantan el domingo 29 de marzo.
      const antes = zonedTimeToUtc(2026, 3, 24, 11, 30, "Europe/Madrid");
      const despues = zonedTimeToUtc(2026, 3, 31, 11, 30, "Europe/Madrid");

      expect(antes.toISOString()).toBe("2026-03-24T10:30:00.000Z");
      expect(despues.toISOString()).toBe("2026-03-31T09:30:00.000Z");

      // Sumar 7 × 24 h —el atajo evidente— habría dado las 12:30 locales.
      const atajo = new Date(antes.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(atajo.toISOString()).not.toBe(despues.toISOString());
    });

    test("resuelve una hora que cae dentro del salto de primavera", () => {
      // Las 02:30 del 29/03/2026 no existen en Madrid; el resultado debe ser un
      // instante real y no un NaN o un desfase de un día.
      const resultado = zonedTimeToUtc(2026, 3, 29, 2, 30, "Europe/Madrid");
      expect(Number.isNaN(resultado.getTime())).toBe(false);
      expect(utcToCivilDate(resultado, "Europe/Madrid")).toEqual({
        year: 2026,
        month: 3,
        day: 29,
      });
    });
  });

  describe("Aritmética de fechas civiles", () => {
    test("civilDayOfWeek sigue el convenio de Date.getDay()", () => {
      // 13 de enero de 2026: martes.
      expect(civilDayOfWeek({ year: 2026, month: 1, day: 13 })).toBe(2);
      // 4 de enero de 2026: domingo.
      expect(civilDayOfWeek({ year: 2026, month: 1, day: 4 })).toBe(0);
    });

    test("addCivilDays cruza el fin de mes y el fin de año", () => {
      expect(addCivilDays({ year: 2026, month: 1, day: 30 }, 7)).toEqual({
        year: 2026,
        month: 2,
        day: 6,
      });
      expect(addCivilDays({ year: 2026, month: 12, day: 29 }, 7)).toEqual({
        year: 2027,
        month: 1,
        day: 5,
      });
    });

    test("addCivilDays no pierde un día al cruzar el cambio de hora", () => {
      // Sumar 24 h reales sobre la medianoche del cambio se quedaría en el mismo día.
      expect(addCivilDays({ year: 2026, month: 3, day: 28 }, 1)).toEqual({
        year: 2026,
        month: 3,
        day: 29,
      });
    });

    test("el viaje de ida y vuelta por medianoche UTC conserva el día", () => {
      const civil = { year: 2026, month: 10, day: 25 };
      expect(utcMidnightToCivilDate(civilDateToUtcMidnight(civil))).toEqual(civil);
    });

    test("compareCivilDates ordena por calendario", () => {
      expect(
        compareCivilDates({ year: 2026, month: 2, day: 1 }, { year: 2026, month: 10, day: 1 })
      ).toBeLessThan(0);
      expect(
        compareCivilDates({ year: 2026, month: 3, day: 9 }, { year: 2026, month: 3, day: 9 })
      ).toBe(0);
    });

    test("civilDateKey usa la misma clave que el catálogo de festivos", () => {
      expect(civilDateKey({ year: 2026, month: 1, day: 6 })).toBe("2026-01-06");
    });
  });

  describe("Lectura de entradas", () => {
    test("parseCivilDate acepta el formato de la agenda y rechaza el resto", () => {
      expect(parseCivilDate("2026-09-04")).toEqual({ year: 2026, month: 9, day: 4 });
      expect(parseCivilDate("2026-02-31")).toBeNull();
      expect(parseCivilDate("04/09/2026")).toBeNull();
    });

    test("parseTimeOfDay acepta horas válidas y rechaza las imposibles", () => {
      expect(parseTimeOfDay("11:30")).toEqual({ hours: 11, minutes: 30 });
      expect(parseTimeOfDay("9:05")).toEqual({ hours: 9, minutes: 5 });
      expect(parseTimeOfDay("24:00")).toBeNull();
      expect(parseTimeOfDay("11:60")).toBeNull();
      expect(parseTimeOfDay("11h30")).toBeNull();
    });
  });
});
