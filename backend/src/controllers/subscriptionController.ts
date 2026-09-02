import * as subscriptionService from "../services/subscriptionService.js";
import { ApiResponse } from "../utils/index.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export async function getCurrentSubscription(req: AuthRequest, res: Response) {
  const businessId = req.user?.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const details = await subscriptionService.getSubscriptionDetails(businessId);
  if (!details) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  return ApiResponse.success(res, details);
}

export async function createCheckoutUrl(req: AuthRequest, res: Response) {
  const businessId = req.user?.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const { plan = "PRO" } = req.body || {};

  const checkoutData = await subscriptionService.createCheckoutSession({
    businessId,
    plan,
    userEmail: req.user?.email,
    userName: req.user?.name,
  });

  return ApiResponse.success(res, checkoutData);
}

export async function cancelSubscription(req: AuthRequest, res: Response) {
  const businessId = req.user?.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const updated = await subscriptionService.cancelSubscription(businessId);
  return ApiResponse.success(res, {
    message: "Suscripción cancelada al término del periodo actual.",
    business: updated,
  });
}

export async function mockActivate(req: AuthRequest, res: Response) {
  const businessId =
    req.user?.businessId || (req.query.businessId as string) || (req.body.businessId as string);
  const plan = (req.body.plan as string) || (req.query.plan as string) || "PRO";

  if (!businessId) {
    return res.status(400).json({ error: "ID de negocio requerido" });
  }

  const updated = await subscriptionService.activateMockSubscription(businessId, plan);
  return ApiResponse.success(res, {
    message: `Plan ${plan} activado con éxito (Modo Desarrollo)`,
    business: updated,
  });
}

export async function getInvoices(req: AuthRequest, res: Response) {
  const businessId = req.user?.businessId;
  if (!businessId) {
    return res.status(400).json({ error: "El usuario no tiene un negocio asociado" });
  }

  const details = await subscriptionService.getSubscriptionDetails(businessId);
  return ApiResponse.success(res, details?.invoices || []);
}

export async function handleWebhook(req: Request & { rawBody?: string }, res: Response) {
  try {
    const signature = req.headers["x-signature"] as string | undefined;
    const payload = req.rawBody || req.body;

    const result = await subscriptionService.processWebhookEvent(payload, signature);
    return res.status(200).json({ received: true, result });
  } catch (err: any) {
    console.error("[LemonSqueezy Webhook Error]", err.message);
    return res.status(400).json({ error: err.message });
  }
}

export default {
  getCurrentSubscription,
  createCheckoutUrl,
  cancelSubscription,
  mockActivate,
  getInvoices,
  handleWebhook,
};
