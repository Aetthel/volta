import * as lopdService from "../services/lopdService.js";
import {
  getPolicy,
  isKnownPolicyVersion,
  CURRENT_POLICY_VERSION,
} from "../policies/privacyPolicy.js";
import { computeHmac } from "../utils/index.js";
import config from "../config/index.js";
import { ApiResponse } from "../utils/index.js";
import crypto from "crypto";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const verifyToken = (id?: string | null, token?: string | string[] | null, exp?: string | string[] | null): boolean => {
  if (!token || !id || !exp) return false;
  const tokenStr = Array.isArray(token) ? token[0]! : token;
  const expStr = Array.isArray(exp) ? exp[0]! : exp;

  const expiry = parseInt(expStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  const tokenData = `${id}:${expiry}`;
  const expectedToken = computeHmac(tokenData, config.lopdHmacSecret);
  try {
    return crypto.timingSafeEqual(Buffer.from(tokenStr), Buffer.from(expectedToken));
  } catch {
    return false;
  }
};

const toPublicConsent = (client: any) => ({
  clientName: client.name,
  businessName: client.business?.name ?? null,
  lopdStatus: client.lopdStatus,
});

export const getConsent = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const token = req.headers["x-lopd-token"] || req.query.token;
  const exp = req.headers["x-lopd-exp"] || req.query.exp;

  if (!verifyToken(id, token as any, exp as any)) {
    return res.status(400).json({ error: "Token de firma inválido, faltante o expirado." });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  const policy = getPolicy({
    clientName: client.name,
    businessName: client.business?.name,
    businessType: client.business?.businessType,
    businessEmail: client.business?.email,
    businessPhone: client.business?.phone,
    businessAddress: client.business?.address,
  });

  return ApiResponse.success(res, { ...toPublicConsent(client), policy });
};

export const acceptConsent = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const token = req.headers["x-lopd-token"] || req.query.token;
  const exp = req.headers["x-lopd-exp"] || req.query.exp;

  if (!verifyToken(id, token as any, exp as any)) {
    return res.status(400).json({ error: "Token de firma inválido, faltante o expirado." });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  if (client.lopdStatus === "Aceptado") {
    return ApiResponse.success(res, { success: true, client: toPublicConsent(client) });
  }

  const ipAddress = req.ip || "Unknown";
  const userAgent = (req.headers["user-agent"] as string) || "Unknown";

  const reportedVersion = req.body?.policyVersion;
  const policyVersion = isKnownPolicyVersion(reportedVersion)
    ? reportedVersion
    : CURRENT_POLICY_VERSION;

  const { updatedClient } = await lopdService.acceptConsent(id, {
    ipAddress,
    userAgent,
    policyVersion,
  });

  return ApiResponse.success(res, {
    success: true,
    client: toPublicConsent({ ...updatedClient, business: client.business }),
  });
};

export const rejectConsent = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const token = req.headers["x-lopd-token"] || req.query.token;
  const exp = req.headers["x-lopd-exp"] || req.query.exp;

  if (!verifyToken(id, token as any, exp as any)) {
    return res.status(400).json({ error: "Token de firma inválido, faltante o expirado." });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  if (client.lopdStatus === "Rechazado") {
    return ApiResponse.success(res, { success: true, client: toPublicConsent(client) });
  }

  const { updatedClient } = await lopdService.rejectConsent(id);

  return ApiResponse.success(res, {
    success: true,
    client: toPublicConsent({ ...updatedClient, business: client.business }),
  });
};

export const getConsentLogs = async (req: AuthRequest, res: Response) => {
  const { id: clientId } = req.params as { id: string };
  const businessId = req.user?.businessId;

  if (!businessId) {
    return res.status(403).json({ error: "La sesión no tiene un negocio asociado." });
  }

  const logs = await lopdService.getConsentLogsByClient(clientId, businessId);
  return ApiResponse.success(res, { logs });
};

export default {
  getConsent,
  acceptConsent,
  rejectConsent,
  getConsentLogs,
};
