import { validateBusinessHours, calculateAvailableSlots } from "../../utils/businessHours.js";

describe("Business Hours & Slot Validation Utilities", () => {
  const mockBusinessHours = [
    { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false }, // Lunes
    { dayOfWeek: 2, openTime: "09:00", closeTime: "20:00", isClosed: false }, // Martes
    { dayOfWeek: 0, openTime: "00:00", closeTime: "00:00", isClosed: true }, // Domingo
  ];

  describe("validateBusinessHours", () => {
    test("returns valid: true for appointment inside open hours", () => {
      // 2026-07-27 is Monday (day 1), 10:00 AM
      const validDate = new Date("2026-07-27T10:00:00");
      const result = validateBusinessHours(mockBusinessHours, validDate, 30);
      expect(result.valid).toBe(true);
    });

    test("returns valid: false if business is closed on that day", () => {
      // 2026-07-26 is Sunday (day 0)
      const sundayDate = new Date("2026-07-26T10:00:00");
      const result = validateBusinessHours(mockBusinessHours, sundayDate, 30);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("cerrado");
    });

    test("returns valid: false if appointment starts before open time", () => {
      // Monday 08:30 AM
      const earlyDate = new Date("2026-07-27T08:30:00");
      const result = validateBusinessHours(mockBusinessHours, earlyDate, 30);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("apertura");
    });

    test("returns valid: false if appointment ends after close time", () => {
      // Monday 19:45 PM for 30 min duration (ends 20:15)
      const lateDate = new Date("2026-07-27T19:45:00");
      const result = validateBusinessHours(mockBusinessHours, lateDate, 30);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("cierre");
    });
  });

  describe("calculateAvailableSlots", () => {
    test("calculates valid slots excluding occupied slots", () => {
      const dateStr = "2026-07-27"; // Monday
      const existingAppointments = [
        {
          appointmentDate: "2026-07-27T09:00:00",
          status: "PENDING",
          service: { duration: 30 },
        },
      ];

      const slots = calculateAvailableSlots(
        mockBusinessHours,
        existingAppointments,
        dateStr,
        30,
        1,
        30
      );

      expect(slots.length).toBeGreaterThan(0);
      expect(slots).not.toContain("09:00");
      expect(slots).toContain("09:30");
      expect(slots).toContain("10:00");
    });

    test("returns empty array for closed day", () => {
      const sundayDateStr = "2026-07-26"; // Sunday
      const slots = calculateAvailableSlots(mockBusinessHours, [], sundayDateStr, 30, 1, 30);
      expect(slots).toEqual([]);
    });
  });
});
