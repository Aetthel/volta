import { vi, describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../../index.js";
import prisma from "../../config/db.js";
import config from "../../config/index.js";

describe("Demo Routes (/api/demo)", () => {
  const validApiKey = config.apiKey || " VoltaApiKey ";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/demo", () => {
    it("should return 401 if x-api-key header is missing", async () => {
      const res = await request(app).post("/api/demo");
      expect(res.status).toBe(401);
    });

    it("should return 201 Created with generated sandbox credentials when valid API key is sent", async () => {
      const mockTx: any = {
        business: { create: vi.fn().mockResolvedValue({ id: "demo-1" }) },
        user: { create: vi.fn().mockResolvedValue({ id: "u-demo-1" }) },
        alert: { createMany: vi.fn().mockResolvedValue({ count: 5 }) },
        service: {
          createMany: vi.fn().mockResolvedValue({ count: 6 }),
          findMany: vi.fn().mockResolvedValue([
            { id: "s0", name: "Corte Caballero" },
            { id: "s1", name: "Corte Dama" },
            { id: "s2", name: "Coloración Premium" },
            { id: "s3", name: "Tratamiento Keratina" },
            { id: "s4", name: "Manicura" },
          ]),
        },
        businessHours: { createMany: vi.fn().mockResolvedValue({ count: 7 }) },
        client: {
          create: vi
            .fn()
            .mockResolvedValue({ id: "c1", name: "Ana", surname: "García", phone: "+34611234567" }),
        },
        appointment: { create: vi.fn().mockResolvedValue({ id: "a1" }) },
      };

      vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      const res = await request(app).post("/api/demo").set("x-api-key", validApiKey);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.credentials).toBeDefined();
    });
  });

  describe("DELETE /api/demo", () => {
    it("should return 400 if businessId is missing in request", async () => {
      const res = await request(app).delete("/api/demo").set("x-api-key", validApiKey);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("businessId");
    });

    it("should return 200 OK when demo is deleted successfully", async () => {
      vi.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "demo-123",
        subscriptionStatus: "DEMO_SANDBOX",
      } as any);

      const mockTx: any = {
        alert: { deleteMany: vi.fn().mockResolvedValue({}) },
        appointment: { deleteMany: vi.fn().mockResolvedValue({}) },
        client: { deleteMany: vi.fn().mockResolvedValue({}) },
        service: { deleteMany: vi.fn().mockResolvedValue({}) },
        businessHours: { deleteMany: vi.fn().mockResolvedValue({}) },
        user: { deleteMany: vi.fn().mockResolvedValue({}) },
        business: { delete: vi.fn().mockResolvedValue({}) },
      };

      vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        return cb(mockTx);
      });

      const res = await request(app)
        .delete("/api/demo")
        .set("x-api-key", validApiKey)
        .send({ businessId: "demo-123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
