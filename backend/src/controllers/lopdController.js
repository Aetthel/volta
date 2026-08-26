import * as lopdService from "../services/lopdService.js";
import { computeHmac } from "../utils/index.js";
import config from "../config/index.js";
import { ApiResponse } from "../utils/index.js";
import crypto from "crypto";

const verifyToken = (id, token, exp) => {
  if (!token || !id || !exp) return false;
  const expiry = parseInt(exp, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  const tokenData = `${id}:${expiry}`;
  const expectedToken = computeHmac(tokenData, config.lopdHmacSecret);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch {
    return false;
  }
};

export const getConsent = async (req, res) => {
  const { id } = req.params;
  const token = req.headers["x-lopd-token"] || req.query.token;
  const exp = req.headers["x-lopd-exp"] || req.query.exp;

  if (!verifyToken(id, token, exp)) {
    return res.status(400).json({ error: "Token de firma inválido, faltante o expirado." });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  return ApiResponse.success(res, {
    clientName: client.name,
    businessName: client.business.name,
    lopdStatus: client.lopdStatus,
  });
};

export const acceptConsent = async (req, res) => {
  const { id } = req.params;
  const token = req.headers["x-lopd-token"] || req.query.token;
  const exp = req.headers["x-lopd-exp"] || req.query.exp;

  if (!verifyToken(id, token, exp)) {
    return res.status(400).json({ error: "Token de firma inválido, faltante o expirado." });
  }

  const client = await lopdService.getClientConsent(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Idempotencia — ya aceptado, nada que hacer
  if (client.lopdStatus === "Aceptado") {
    return ApiResponse.success(res, { success: true, client });
  }

  const rawIp =
    req.headers["x-forwarded-for"] || req.ip || req.socket?.remoteAddress || "127.0.0.1";
  const ipAddress = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown";

  const { updatedClient, consentLog } = await lopdService.acceptConsent(id, {
    ipAddress,
    userAgent,
    policyVersion: "1.0",
  });

  return ApiResponse.success(res, { success: true, client: updatedClient, consentLog });
};

export const getConsentLogs = async (req, res) => {
  const { id: clientId } = req.params;
  const businessId = req.query.businessId || req.user?.businessId;

  if (!businessId) {
    return res.status(400).json({ error: "ID de negocio requerido." });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const logs = await lopdService.getConsentLogsByClient(clientId, businessId);
  return ApiResponse.success(res, { logs });
};
