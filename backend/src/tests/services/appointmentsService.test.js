import { jest } from "@jest/globals";
import * as appointmentsService from "../../services/appointmentsService.js";
import prisma from "../../config/db.js";

describe("appointmentsService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAppointmentsByBusiness", () => {
    it("should query findMany for the given businessId", async () => {
      const mockAppts = [{ id: "a1", clientName: "Ana" }];
      jest.spyOn(prisma.appointment, "findMany").mockResolvedValue(mockAppts);

      const res = await appointmentsService.getAppointmentsByBusiness("biz-1");
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { businessId: "biz-1" },
        include: { client: true },
        orderBy: { appointmentDate: "asc" },
      });
      expect(res).toEqual(mockAppts);
    });
  });

  describe("createAppointment", () => {
    it("should throw 404 if business is not found", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);

      await expect(
        appointmentsService.createAppointment({
          clientName: "Juan Perez",
          clientPhone: "600000000",
          appointmentDate: "2026-07-27T10:00:00",
          businessId: "non-existent",
        })
      ).rejects.toThrow("Business not found");
    });

    it("should throw 400 if appointment is outside business opening hours", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Biz",
        hours: [
          { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
        ],
      });

      // 08:00 AM on Monday (2026-07-27) - before 09:00 AM
      await expect(
        appointmentsService.createAppointment({
          clientName: "Juan Perez",
          clientPhone: "600000000",
          appointmentDate: "2026-07-27T08:00:00",
          businessId: "biz-1",
        })
      ).rejects.toThrow("apertura");
    });

    it("should throw 409 if slot capacity is already reached", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Biz",
        hours: [
          { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
        ],
      });

      jest.spyOn(prisma.service, "findFirst").mockResolvedValue({
        id: "srv-1",
        name: "Corte",
        duration: 30,
        capacity: 1,
      });

      // Mock an existing overlapping appointment
      jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([
        {
          id: "existing-1",
          appointmentDate: new Date("2026-07-27T10:00:00"),
          status: "PENDING",
          service: { duration: 30 },
        },
      ]);

      await expect(
        appointmentsService.createAppointment({
          clientName: "Maria Garcia",
          clientPhone: "600000001",
          appointmentDate: "2026-07-27T10:15:00", // Overlaps with 10:00-10:30
          businessId: "biz-1",
          service: "Corte",
        })
      ).rejects.toThrow("ocupado");
    });
  });

  describe("deleteAppointment", () => {
    it("should delete appointment by id", async () => {
      jest.spyOn(prisma.appointment, "delete").mockResolvedValue({ id: "a1" });
      const res = await appointmentsService.deleteAppointment("a1");
      expect(prisma.appointment.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
      expect(res).toEqual({ id: "a1" });
    });
  });
});
