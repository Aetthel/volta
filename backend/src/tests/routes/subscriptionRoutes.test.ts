import { vi, describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../../index.js";
import prisma from "../../config/db.js";
import config from "../../config/index.js";
import { signToken } from "../../utils/crypto.js";

describe("Subscription Routes (/api/subscription & /api/webhooks)", () => {
  const validApiKey = config.apiKey;
  const jwtSecret = config.backendJwtSecret;
  const mockUser = {
    id: "user-1",
    email: "owner@salon.com",
    role: "JEFE" as const,
    businessId: "biz-1",
  };
  const token = signToken(mockUser, jwtSecret);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/subscription/current", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/subscription/current");
      expect(res.status).toBe(401);
    });

    it("should return 200 with subscription details for authenticated JEFE", async () => {
      vi.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Salon",
        subscriptionPlan: "PRO",
        subscriptionStatus: "ACTIVE",
        invoices: [],
      } as any);

      const res = await request(app)
        .get("/api/subscription/current")
        .set("x-api-key", validApiKey)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.subscriptionPlan).toBe("PRO");
    });
  });

  describe("POST /api/subscription/checkout-url", () => {
    it("should return checkout session data", async () => {
      vi.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Salon",
      } as any);

      const res = await request(app)
        .post("/api/subscription/checkout-url")
        .set("x-api-key", validApiKey)
        .set("Authorization", `Bearer ${token}`)
        .send({ plan: "PRO" });

      expect(res.status).toBe(200);
      expect(res.body.url).toBeDefined();
    });
  });

  describe("POST /api/webhooks/lemonsqueezy", () => {
    it("should process webhook and return 200 received: true", async () => {
      const webhookPayload = {
        meta: {
          event_name: "subscription_payment_success",
          custom_data: {
            business_id: "biz-1",
            plan: "PRO",
          },
        },
        data: {
          id: "sub-123",
          attributes: {
            customer_id: "cust-456",
            total: 2500,
            currency: "EUR",
          },
        },
      };

      vi.spyOn(prisma.business, "update").mockResolvedValue({ id: "biz-1" } as any);
      vi.spyOn(prisma.invoice, "count").mockResolvedValue(0);
      vi.spyOn(prisma.invoice, "create").mockResolvedValue({ id: "inv-1" } as any);

      const res = await request(app)
        .post("/api/webhooks/lemonsqueezy")
        .send(webhookPayload);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });
});
