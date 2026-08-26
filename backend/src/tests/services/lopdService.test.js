import { jest } from "@jest/globals";
import * as lopdService from "../../services/lopdService.js";
import prisma from "../../config/db.js";

describe("lopdService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("acceptConsent", () => {
    it("should update client status and create a LopdConsentLog audit record", async () => {
      const mockClient = {
        id: "client-1",
        name: "Carlos",
        businessId: "biz-123",
        lopdStatus: "Pendiente",
      };

      const mockLog = {
        id: "log-1",
        clientId: "client-1",
        businessId: "biz-123",
        ipAddress: "192.168.1.50",
        userAgent: "Mozilla/5.0",
        policyVersion: "1.0",
        acceptedAt: new Date(),
      };

      // Las escrituras ocurren dentro de prisma.$transaction, así que el cliente
      // transaccional que recibe el callback debe ser el mismo objeto mockeado.
      jest.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(prisma));

      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue({
        ...mockClient,
        lopdStatus: "Aceptado",
      });
      jest.spyOn(prisma.lopdConsentLog, "create").mockResolvedValue(mockLog);
      jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);

      const result = await lopdService.acceptConsent("client-1", {
        ipAddress: "192.168.1.50",
        userAgent: "Mozilla/5.0",
        policyVersion: "1.0",
      });

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: "client-1" },
        data: { lopdStatus: "Aceptado" },
      });

      expect(prisma.lopdConsentLog.create).toHaveBeenCalledWith({
        data: {
          clientId: "client-1",
          businessId: "biz-123",
          ipAddress: "192.168.1.50",
          userAgent: "Mozilla/5.0",
          policyVersion: "1.0",
        },
      });

      expect(result.consentLog).toEqual(mockLog);
      expect(result.updatedClient.lopdStatus).toBe("Aceptado");
    });

    it("should write the status change and the audit log inside a single transaction", async () => {
      // Guarda de regresión: si alguien vuelve a separar las dos escrituras, un
      // fallo al registrar la auditoría dejaría al cliente marcado como
      // "Aceptado" sin prueba alguna del consentimiento.
      const mockClient = { id: "client-1", businessId: "biz-123", lopdStatus: "Pendiente" };

      const transactionSpy = jest
        .spyOn(prisma, "$transaction")
        .mockImplementation(async (callback) => callback(prisma));

      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue({
        ...mockClient,
        lopdStatus: "Aceptado",
      });
      jest.spyOn(prisma.lopdConsentLog, "create").mockResolvedValue({ id: "log-1" });
      jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);

      await lopdService.acceptConsent("client-1");

      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(prisma.client.update).toHaveBeenCalled();
      expect(prisma.lopdConsentLog.create).toHaveBeenCalled();
    });

    it("should not leave the client accepted if the audit log write fails", async () => {
      const mockClient = { id: "client-1", businessId: "biz-123", lopdStatus: "Pendiente" };

      // Se emula el comportamiento real: si el callback lanza, la transacción
      // propaga el error y ninguna de las dos escrituras queda confirmada.
      jest.spyOn(prisma, "$transaction").mockImplementation(async (callback) => callback(prisma));

      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue({
        ...mockClient,
        lopdStatus: "Aceptado",
      });
      jest
        .spyOn(prisma.lopdConsentLog, "create")
        .mockRejectedValue(new Error("audit log write failed"));
      const findManySpy = jest.spyOn(prisma.appointment, "findMany").mockResolvedValue([]);

      await expect(lopdService.acceptConsent("client-1")).rejects.toThrow("audit log write failed");

      // Si el consentimiento no se ha confirmado, tampoco deben salir mensajes.
      expect(findManySpy).not.toHaveBeenCalled();
    });
  });

  describe("purgeExpiredConsentIdentifiers", () => {
    it("should purge only identifiers older than the retention period", async () => {
      const updateManySpy = jest
        .spyOn(prisma.lopdConsentLog, "updateMany")
        .mockResolvedValue({ count: 4 });

      const now = new Date("2026-08-25T00:00:00.000Z");
      const result = await lopdService.purgeExpiredConsentIdentifiers(now);

      const expectedCutoff = new Date("2023-08-25T00:00:00.000Z");
      expect(result.cutoff).toEqual(expectedCutoff);
      expect(result.purgedCount).toBe(4);

      expect(updateManySpy).toHaveBeenCalledWith({
        where: {
          acceptedAt: { lt: expectedCutoff },
          NOT: { ipAddress: lopdService.PURGED_IDENTIFIER },
        },
        data: {
          ipAddress: lopdService.PURGED_IDENTIFIER,
          userAgent: lopdService.PURGED_IDENTIFIER,
        },
      });
    });

    it("should not delete rows, only redact their network identifiers", async () => {
      // El registro de consentimiento debe sobrevivir a la purga: lo que prueba
      // el consentimiento es quién, cuándo y bajo qué versión de la política.
      const deleteManySpy = jest.spyOn(prisma.lopdConsentLog, "deleteMany");
      jest.spyOn(prisma.lopdConsentLog, "updateMany").mockResolvedValue({ count: 1 });

      await lopdService.purgeExpiredConsentIdentifiers(new Date());

      expect(deleteManySpy).not.toHaveBeenCalled();
    });
  });
});
