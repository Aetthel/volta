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
  });
});
