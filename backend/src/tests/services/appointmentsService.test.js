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

  describe("deleteAppointment", () => {
    it("should delete appointment by id", async () => {
      jest.spyOn(prisma.appointment, "delete").mockResolvedValue({ id: "a1" });
      const res = await appointmentsService.deleteAppointment("a1");
      expect(prisma.appointment.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
      expect(res).toEqual({ id: "a1" });
    });
  });
});
