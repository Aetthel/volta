import { jest } from "@jest/globals";
import * as demoService from "../../services/demoService.js";
import prisma from "../../config/db.js";

describe("demoService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("deleteDemo", () => {
    it("should return false if business not found or not DEMO_SANDBOX", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);
      const result = await demoService.deleteDemo("non-existing-id");
      expect(result).toBe(false);
    });

    it("should return false if business subscriptionStatus is not DEMO_SANDBOX", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "b1",
        subscriptionStatus: "ACTIVE",
      });
      const result = await demoService.deleteDemo("b1");
      expect(result).toBe(false);
    });

    it("should return true and execute transaction if subscriptionStatus is DEMO_SANDBOX", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "demo-123",
        subscriptionStatus: "DEMO_SANDBOX",
      });

      const mockTx = {
        alert: { deleteMany: jest.fn().mockResolvedValue({}) },
        appointment: { deleteMany: jest.fn().mockResolvedValue({}) },
        client: { deleteMany: jest.fn().mockResolvedValue({}) },
        service: { deleteMany: jest.fn().mockResolvedValue({}) },
        businessHours: { deleteMany: jest.fn().mockResolvedValue({}) },
        user: { deleteMany: jest.fn().mockResolvedValue({}) },
        business: { delete: jest.fn().mockResolvedValue({}) },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const result = await demoService.deleteDemo("demo-123");
      expect(result).toBe(true);
    });
  });

  describe("cleanupExpiredDemos", () => {
    it("should find expired demos and execute cleanup transaction", async () => {
      jest
        .spyOn(prisma.business, "findMany")
        .mockResolvedValue([{ id: "expired-1" }, { id: "expired-2" }]);

      const mockTx = {
        alert: { deleteMany: jest.fn().mockResolvedValue({}) },
        appointment: { deleteMany: jest.fn().mockResolvedValue({}) },
        client: { deleteMany: jest.fn().mockResolvedValue({}) },
        service: { deleteMany: jest.fn().mockResolvedValue({}) },
        businessHours: { deleteMany: jest.fn().mockResolvedValue({}) },
        user: { deleteMany: jest.fn().mockResolvedValue({}) },
        business: { delete: jest.fn().mockResolvedValue({}) },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const res = await demoService.cleanupExpiredDemos();
      expect(res.totalExpired).toBe(2);
      expect(res.deletedCount).toBe(2);
    });
  });
});
