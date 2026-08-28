import { jest } from "@jest/globals";
import * as subscriptionService from "../../services/subscriptionService.js";
import prisma from "../../config/db.js";

describe("Subscription Service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getSubscriptionDetails", () => {
    it("should return null if business does not exist", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);
      const res = await subscriptionService.getSubscriptionDetails("non-existent");
      expect(res).toBeNull();
    });

    it("should calculate active trial days correctly", async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Salon",
        email: "salon@test.com",
        subscriptionPlan: "PRO",
        subscriptionStatus: "TRIALING",
        trialExpiresAt: futureDate,
        invoices: [],
      });

      const res = await subscriptionService.getSubscriptionDetails("biz-1");
      expect(res).toBeDefined();
      expect(res.isTrialActive).toBe(true);
      expect(res.daysLeftInTrial).toBeGreaterThanOrEqual(4);
    });

    it("should detect active grace period", async () => {
      const gracePeriod = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days left
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        subscriptionPlan: "PRO",
        subscriptionStatus: "ACTIVE",
        gracePeriodExpiresAt: gracePeriod,
        invoices: [],
      });

      const res = await subscriptionService.getSubscriptionDetails("biz-1");
      expect(res.isGracePeriodActive).toBe(true);
    });
  });

  describe("createCheckoutSession", () => {
    it("should throw error if business does not exist", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue(null);
      await expect(
        subscriptionService.createCheckoutSession({ businessId: "non-existent" })
      ).rejects.toThrow("Negocio no encontrado");
    });

    it("should return mock activation url when API keys are not present", async () => {
      jest.spyOn(prisma.business, "findUnique").mockResolvedValue({
        id: "biz-1",
        name: "Test Salon",
      });

      const res = await subscriptionService.createCheckoutSession({
        businessId: "biz-1",
        plan: "PRO",
      });

      expect(res.isMock).toBe(true);
      expect(res.plan).toBe("PRO");
      expect(res.url).toContain("mock-activate");
    });
  });

  describe("processWebhookEvent", () => {
    it("should process subscription_created and activate business plan and create invoice", async () => {
      const payload = {
        meta: {
          event_name: "subscription_created",
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
            urls: {
              invoice_url: "https://lemonsqueezy.com/invoices/1",
            },
          },
        },
      };

      jest.spyOn(prisma.business, "update").mockResolvedValue({
        id: "biz-1",
        subscriptionStatus: "ACTIVE",
      });
      jest.spyOn(prisma.invoice, "count").mockResolvedValue(0);
      jest.spyOn(prisma.invoice, "create").mockResolvedValue({
        id: "inv-1",
        invoiceNumber: "INV-2026-0001",
      });

      const res = await subscriptionService.processWebhookEvent(payload, null);
      expect(res.processed).toBe(true);
      expect(res.status).toBe("ACTIVE");
      expect(prisma.business.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "biz-1" },
          data: expect.objectContaining({
            subscriptionStatus: "ACTIVE",
            subscriptionPlan: "PRO",
          }),
        })
      );
    });

    it("should set 3 days grace period on subscription_payment_failed", async () => {
      const payload = {
        meta: {
          event_name: "subscription_payment_failed",
          custom_data: {
            business_id: "biz-1",
          },
        },
        data: {
          attributes: {},
        },
      };

      jest.spyOn(prisma.business, "update").mockResolvedValue({
        id: "biz-1",
      });

      const res = await subscriptionService.processWebhookEvent(payload, null);
      expect(res.processed).toBe(true);
      expect(res.gracePeriodExpiresAt).toBeDefined();
      expect(prisma.business.update).toHaveBeenCalled();
    });
  });

  describe("activateMockSubscription", () => {
    it("should activate business plan and register invoice directly in mock mode", async () => {
      jest.spyOn(prisma.business, "update").mockResolvedValue({
        id: "biz-1",
        subscriptionPlan: "PRO",
        subscriptionStatus: "ACTIVE",
      });
      jest.spyOn(prisma.invoice, "count").mockResolvedValue(1);
      jest.spyOn(prisma.invoice, "create").mockResolvedValue({
        id: "inv-2",
        invoiceNumber: "INV-2026-0002",
      });

      const res = await subscriptionService.activateMockSubscription("biz-1", "PRO");
      expect(res.subscriptionStatus).toBe("ACTIVE");
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            businessId: "biz-1",
            amount: 25.0,
            status: "PAID",
          }),
        })
      );
    });
  });
});
