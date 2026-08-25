import * as subscriptionService from "../services/subscriptionService.js";
import { ApiResponse } from "../utils/index.js";

/**
 * GET /api/subscription/current
 * Returns the current subscription, plan, and invoice history for the business
 */
export async function getCurrentSubscription(req, res) {
  const businessId = req.user.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const details = await subscriptionService.getSubscriptionDetails(businessId);
  if (!details) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  return ApiResponse.success(res, details);
}

/**
 * POST /api/subscription/checkout-url
 * Generates a Lemon Squeezy checkout session or mock activation URL
 */
export async function createCheckoutUrl(req, res) {
  const businessId = req.user.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const { plan = "PRO" } = req.body || {};

  const checkoutData = await subscriptionService.createCheckoutSession({
    businessId,
    plan,
    userEmail: req.user.email,
    userName: req.user.name,
  });

  return ApiResponse.success(res, checkoutData);
}

/**
 * POST /api/subscription/cancel
 * Schedules subscription cancellation at end of current period
 */
export async function cancelSubscription(req, res) {
  const businessId = req.user.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const updated = await subscriptionService.cancelSubscription(businessId);
  return ApiResponse.success(res, {
    message: "Suscripción cancelada al término del periodo actual.",
    business: updated,
  });
}

/**
 * POST /api/subscription/mock-activate
 * Instant activation for local development/testing without real payment keys
 */
export async function mockActivate(req, res) {
  const businessId = req.user?.businessId || req.query.businessId || req.body.businessId;
  const plan = req.body.plan || req.query.plan || "PRO";

  if (!businessId) {
    return res.status(400).json({ error: "ID de negocio requerido" });
  }

  const updated = await subscriptionService.activateMockSubscription(businessId, plan);
  return ApiResponse.success(res, {
    message: `Plan ${plan} activado con éxito (Modo Desarrollo)`,
    business: updated,
  });
}

/**
 * GET /api/subscription/invoices
 * Returns all invoices for the authenticated business
 */
export async function getInvoices(req, res) {
  const businessId = req.user.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const details = await subscriptionService.getSubscriptionDetails(businessId);
  return ApiResponse.success(res, details?.invoices || []);
}

/**
 * POST /api/webhooks/lemonsqueezy
 * Webhook handler for Lemon Squeezy events
 */
export async function handleWebhook(req, res) {
  try {
    const signature = req.headers["x-signature"];
    const payload = req.rawBody || req.body;

    const result = await subscriptionService.processWebhookEvent(payload, signature);
    return res.status(200).json({ received: true, result });
  } catch (err) {
    console.error("[LemonSqueezy Webhook Error]", err.message);
    return res.status(400).json({ error: err.message });
  }
}
