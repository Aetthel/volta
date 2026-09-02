import prisma from "../config/db.js";
import crypto from "crypto";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const LEMONSQUEEZY_VARIANT_BASIC = process.env.LEMONSQUEEZY_VARIANT_BASIC || "variant_basic";
const LEMONSQUEEZY_VARIANT_PRO = process.env.LEMONSQUEEZY_VARIANT_PRO || "variant_pro";

/**
 * Get current business subscription details and invoices
 */
export async function getSubscriptionDetails(businessId) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      trialExpiresAt: true,
      sandboxExpiresAt: true,
      gracePeriodExpiresAt: true,
      cancelAtPeriodEnd: true,
      lemonSqueezyCustomerId: true,
      lemonSqueezySubscriptionId: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!business) return null;

  const now = new Date();
  const isTrialActive =
    business.subscriptionStatus === "TRIALING" &&
    business.trialExpiresAt &&
    new Date(business.trialExpiresAt) > now;

  const isGracePeriodActive =
    business.gracePeriodExpiresAt && new Date(business.gracePeriodExpiresAt) > now;

  return {
    ...business,
    isTrialActive,
    isGracePeriodActive,
    daysLeftInTrial:
      business.trialExpiresAt && new Date(business.trialExpiresAt) > now
        ? Math.ceil((new Date(business.trialExpiresAt) - now) / (1000 * 60 * 60 * 24))
        : 0,
  };
}

/**
 * Create a Lemon Squeezy checkout session or return a mock checkout for local dev
 */
export async function createCheckoutSession({ businessId, plan = "PRO", userEmail, userName }) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw new Error("Negocio no encontrado");
  }

  const selectedPlan = plan.toUpperCase() === "BASIC" ? "BASIC" : "PRO";
  const variantId = selectedPlan === "BASIC" ? LEMONSQUEEZY_VARIANT_BASIC : LEMONSQUEEZY_VARIANT_PRO;

  // Real Lemon Squeezy API integration
  if (LEMONSQUEEZY_API_KEY && LEMONSQUEEZY_STORE_ID) {
    try {
      const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                email: userEmail || business.email || undefined,
                name: userName || business.name || undefined,
                custom: {
                  business_id: businessId,
                  plan: selectedPlan,
                },
              },
              product_options: {
                enabled_variants: [variantId],
                redirect_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/ajustes?checkout=success`,
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: String(LEMONSQUEEZY_STORE_ID),
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: String(variantId),
                },
              },
            },
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.data?.attributes?.url) {
        console.error("[LemonSqueezy] Checkout error:", data);
        throw new Error(data?.errors?.[0]?.detail || "Error al crear sesión en Lemon Squeezy");
      }

      return {
        url: data.data.attributes.url,
        isMock: false,
        plan: selectedPlan,
      };
    } catch (err) {
      console.warn("[LemonSqueezy] Falling back to local mock checkout:", err.message);
    }
  }

  // Local development / Test mode simulation
  return {
    url: `/api/backend/subscription/mock-activate?businessId=${businessId}&plan=${selectedPlan}`,
    isMock: true,
    plan: selectedPlan,
    message: "Modo de prueba local activado (sin API keys de Lemon Squeezy)",
  };
}

/**
 * Handle Lemon Squeezy webhook events
 */
export async function processWebhookEvent(payload, signature) {
  // Validate HMAC signature if secret is provided
  if (LEMONSQUEEZY_WEBHOOK_SECRET && signature) {
    const rawPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = Buffer.from(hmac.update(rawPayload).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      throw new Error("Firma de webhook inválida");
    }
  }

  const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  const eventName = parsedPayload?.meta?.event_name;
  const customData = parsedPayload?.meta?.custom_data || {};
  const attributes = parsedPayload?.data?.attributes || {};
  let businessId = customData.business_id || customData.businessId;

  if (!businessId && (customData.user_id || customData.userId)) {
    const userId = customData.user_id || customData.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true },
    });
    if (user?.businessId) {
      businessId = user.businessId;
    }
  }

  console.log(`[LemonSqueezy Webhook] Received event: ${eventName} for business: ${businessId}`);

  if (!businessId) {
    // Try to find business by customer id
    const customerId = String(attributes.customer_id || "");
    if (customerId) {
      const foundBusiness = await prisma.business.findFirst({
        where: { lemonSqueezyCustomerId: customerId },
        select: { id: true },
      });
      if (foundBusiness) businessId = foundBusiness.id;
    }
    if (!businessId) return { processed: false, reason: "No businessId or customerId found" };
  }

  switch (eventName) {
    case "subscription_created":
    case "subscription_payment_success": {
      const plan = (customData.plan || "PRO").toUpperCase() === "BASIC" ? "BASIC" : "PRO";
      const defaultCents = plan === "BASIC" ? 3000 : 4000;
      const totalAmount = (attributes.total || attributes.subtotal || defaultCents) / 100;
      const invoiceUrl = attributes.urls?.invoice_url || attributes.urls?.receipt || null;
      const subscriptionId = String(parsedPayload?.data?.id || "");
      const customerId = String(attributes.customer_id || "");

      await prisma.business.update({
        where: { id: businessId },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: "ACTIVE",
          gracePeriodExpiresAt: null,
          cancelAtPeriodEnd: false,
          lemonSqueezyCustomerId: customerId || undefined,
          lemonSqueezySubscriptionId: subscriptionId || undefined,
        },
      });

      // Register Invoice
      const invoiceCount = await prisma.invoice.count({ where: { businessId } });
      const year = new Date().getFullYear();
      const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

      await prisma.invoice.create({
        data: {
          businessId,
          lemonSqueezyId: String(parsedPayload?.data?.id || `${Date.now()}`),
          invoiceNumber,
          amount: totalAmount,
          currency: (attributes.currency || "EUR").toUpperCase(),
          status: "PAID",
          invoiceUrl,
          billingReason: `Suscripción Volta Plan ${plan} Mensual`,
        },
      });

      return { processed: true, eventName, status: "ACTIVE" };
    }

    case "subscription_payment_failed": {
      // 3 days grace period
      const gracePeriodExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await prisma.business.update({
        where: { id: businessId },
        data: {
          gracePeriodExpiresAt,
        },
      });
      return { processed: true, eventName, gracePeriodExpiresAt };
    }

    case "subscription_cancelled": {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
      return { processed: true, eventName, cancelAtPeriodEnd: true };
    }

    case "subscription_expired": {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          subscriptionStatus: "EXPIRED",
        },
      });
      return { processed: true, eventName, status: "EXPIRED" };
    }

    default:
      return { processed: true, eventName, note: "Unhandled event ignored" };
  }
}

/**
 * Direct activation for mock/local test environment
 */
export async function activateMockSubscription(businessId, plan = "PRO") {
  const selectedPlan = plan.toUpperCase() === "BASIC" ? "BASIC" : "PRO";
  const amount = selectedPlan === "BASIC" ? 30.0 : 40.0;

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionPlan: selectedPlan,
      subscriptionStatus: "ACTIVE",
      gracePeriodExpiresAt: null,
      cancelAtPeriodEnd: false,
    },
  });

  const invoiceCount = await prisma.invoice.count({ where: { businessId } });
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

  await prisma.invoice.create({
    data: {
      businessId,
      lemonSqueezyId: `mock_${Date.now()}`,
      invoiceNumber,
      amount,
      currency: "EUR",
      status: "PAID",
      invoiceUrl: `https://app.lemonsqueezy.com/my-orders/mock-${invoiceNumber}`,
      billingReason: `Suscripción Volta Plan ${selectedPlan} Mensual (Test Local)`,
    },
  });

  return updated;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(businessId) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) throw new Error("Negocio no encontrado");

  // Call Lemon Squeezy API if subscription ID exists
  if (LEMONSQUEEZY_API_KEY && business.lemonSqueezySubscriptionId) {
    try {
      await fetch(
        `https://api.lemonsqueezy.com/v1/subscriptions/${business.lemonSqueezySubscriptionId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.api+json",
            Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          },
        }
      );
    } catch (err) {
      console.error("[LemonSqueezy] Error cancelling remote subscription:", err);
    }
  }

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  return updated;
}
