import { describe, it, expect, vi, afterEach } from "vitest";
import prisma from "../../config/db.js";
import whatsappManager from "../../services/whatsappService.js";
import { formatMessage, sendWelcomeMessage, runSentinel } from "../../services/botService.js";

describe("botService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatMessage", () => {
    it("returns null if template is empty or undefined", () => {
      expect(formatMessage(null, {})).toBeNull();
      expect(formatMessage(undefined, {})).toBeNull();
      expect(formatMessage("", {})).toBeNull();
    });

    it("formats message with Madrid civil time even on UTC timestamps", () => {
      // 2026-07-27T15:00:00Z in Europe/Madrid is UTC+2 (summer time) => 17:00
      const utcDate = new Date("2026-07-27T15:00:00.000Z");
      const template = "Hola {nombre}, tu cita para {servicio} en {negocio} es a las {hora}.";

      const res = formatMessage(template, {
        clientName: "María López",
        appointmentDate: utcDate,
        businessName: "Peluquería Volta",
        serviceName: "Corte y peinado",
      });

      expect(res).toContain("Hola María");
      expect(res).toContain("Corte y peinado");
      expect(res).toContain("Peluquería Volta");
      expect(res).toContain("17:00");
    });

    it("replaces both single-brace and double-brace placeholders", () => {
      const template = "Cita de {{clientName}} para {{serviceName}} con enlace {{lopdUrl}}.";
      const res = formatMessage(template, {
        clientName: "Carlos Pérez",
        serviceName: "Barba",
        lopdUrl: "https://volta.es/lopd/123",
      });

      expect(res).toBe("Cita de Carlos para Barba con enlace https://volta.es/lopd/123.");
    });
  });

  describe("sendWelcomeMessage", () => {
    it("skips welcome message if appointment was cancelled (attended: false)", async () => {
      const sendSpy = vi.spyOn(whatsappManager, "sendMessage").mockResolvedValue({});
      vi.spyOn(prisma.appointment, "findUnique").mockResolvedValue({
        id: "appt-1",
        businessId: "biz-1",
        attended: false,
        client: { lopdStatus: "Aceptado" },
        business: { name: "Biz" },
      } as any);

      await sendWelcomeMessage("appt-1");
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });

  describe("runSentinel", () => {
    it("excludes cancelled appointments (attended: false) from scan", async () => {
      const findSpy = vi.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);

      await runSentinel();

      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PENDING",
            attended: { not: false },
          }),
        })
      );
    });

    it("does not set status: ERROR when WhatsApp is disconnected if appointment is > 2h away", async () => {
      const farFutureDate = new Date(Date.now() + 20 * 60 * 60 * 1000); // 20 hours away
      const mockAppt = {
        id: "appt-far",
        clientPhone: "600112233",
        clientName: "Laura",
        appointmentDate: farFutureDate,
        businessId: "biz-1",
        client: { lopdStatus: "Aceptado" },
        business: { name: "Biz", whatsappStatus: "DISCONNECTED" },
      };

      vi.spyOn(prisma.appointment, "findMany").mockResolvedValue([mockAppt] as any);
      const updateSpy = vi.spyOn(prisma.appointment, "update").mockResolvedValue({} as any);

      await runSentinel();

      // Should NOT set ERROR 20 hours ahead of time
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it("sets status: ERROR when WhatsApp is disconnected if appointment is imminent (< 2h away)", async () => {
      const imminentDate = new Date(Date.now() + 30 * 60 * 1000); // 30 mins away
      const mockAppt = {
        id: "appt-soon",
        clientPhone: "600112233",
        clientName: "Laura",
        appointmentDate: imminentDate,
        businessId: "biz-1",
        client: { lopdStatus: "Aceptado" },
        business: { name: "Biz", whatsappStatus: "DISCONNECTED" },
      };

      vi.spyOn(prisma.appointment, "findMany").mockResolvedValue([mockAppt] as any);
      const updateSpy = vi.spyOn(prisma.appointment, "update").mockResolvedValue({} as any);

      await runSentinel();

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: "appt-soon" },
        data: { status: "ERROR" },
      });
    });
  });
});
