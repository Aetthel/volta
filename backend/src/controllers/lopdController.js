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

// Proyección pública del consentimiento: los únicos 3 campos que la página
// necesita. Todo lo que sale por /lopd/* es accesible sin sesión, así que nunca
// se devuelve el registro completo de cliente ni el de negocio.
const toPublicConsent = (client) => ({
  clientName: client.name,
  businessName: client.business?.name ?? null,
  lopdStatus: client.lopdStatus,
});

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

  // La política se sirve desde el backend, que es quien luego estampa la versión
  // en el registro de auditoría. Si el texto viviera en el frontend, editarlo
  // dejaría al backend firmando una versión que ya no corresponde a lo mostrado.
  const policy = getPolicy({
    clientName: client.name,
    businessName: client.business?.name,
    businessType: client.business?.businessType,
  });

  return ApiResponse.success(res, { ...toPublicConsent(client), policy });
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
    return ApiResponse.success(res, { success: true, client: toPublicConsent(client) });
  }

  // req.ip ya resuelve la IP según `trust proxy` (index.js). Leer la cabecera
  // a mano permitía a cualquiera falsear la IP del registro de auditoría.
  const ipAddress = req.ip || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown";

  // Se registra la versión que el cliente tenía delante, no la vigente en este
  // instante: entre cargar la página y pulsar puede haberse desplegado otra, y
  // firmaríamos un texto que nunca llegó a ver. Si lo que llega no es una
  // versión conocida, se cae a la vigente en lugar de guardar algo arbitrario.
  const reportedVersion = req.body?.policyVersion;
  const policyVersion = isKnownPolicyVersion(reportedVersion)
    ? reportedVersion
    : CURRENT_POLICY_VERSION;

  const { updatedClient } = await lopdService.acceptConsent(id, {
    ipAddress,
    userAgent,
    policyVersion,
  });

  // El consentLog NO se devuelve: contiene la IP y el user-agent recién
  // registrados, y esta ruta es pública. `updatedClient` viene del update sin
  // include, así que se le adjunta el business ya cargado arriba.
  return ApiResponse.success(res, {
    success: true,
    client: toPublicConsent({ ...updatedClient, business: client.business }),
  });
};

export const rejectConsent = async (req, res) => {
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

  // Idempotencia — ya rechazado, nada que hacer
  if (client.lopdStatus === "Rechazado") {
    return ApiResponse.success(res, { success: true, client: toPublicConsent(client) });
  }

  const { updatedClient } = await lopdService.rejectConsent(id);

  return ApiResponse.success(res, {
    success: true,
    client: toPublicConsent({ ...updatedClient, business: client.business }),
  });
};

export const getConsentLogs = async (req, res) => {
  const { id: clientId } = req.params;
  // El businessId sale SIEMPRE de la sesión verificada, nunca de la petición:
  // aceptarlo por query permitiría leer la auditoría de cualquier otro negocio.
  const businessId = req.user?.businessId;

  if (!businessId) {
    return res.status(403).json({ error: "La sesión no tiene un negocio asociado." });
  }

  const logs = await lopdService.getConsentLogsByClient(clientId, businessId);
  return ApiResponse.success(res, { logs });
};
