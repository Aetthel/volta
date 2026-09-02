import whatsappManager from "../services/whatsappService.js";
import * as businessService from "../services/businessService.js";
import { ApiResponse } from "../utils/index.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export const initClient = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  await whatsappManager.initClient(businessId);
  return ApiResponse.success(res, { message: "WhatsApp initialization started" });
};

export const getStatus = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.query as { businessId?: string };

  if (!businessId) {
    return res.status(400).json({ error: "businessId es requerido" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessWhatsApp(businessId);

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (business.whatsappStatus !== "CONNECTED") {
    try {
      const state = await whatsappManager.getConnectionState(businessId);
      if (state?.state === "open") {
        await whatsappManager.updateStatus(businessId, "CONNECTED", null);
        business.whatsappStatus = "CONNECTED";
        business.qrCode = null;
      } else if (business.whatsappStatus === "WAITING_QR" && !business.qrCode) {
        const qrData = await whatsappManager.getQr(businessId);
        if (qrData) {
          business.qrCode = qrData;
        }
      }
    } catch {
      // ignore and return db state
    }
  }

  return ApiResponse.success(res, {
    status: business.whatsappStatus,
    qrCode: business.qrCode,
  });
};

export const disconnectClient = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  await whatsappManager.deleteSession(businessId);
  await whatsappManager.updateStatus(businessId, "DISCONNECTED", null);
  return ApiResponse.success(res, { message: "WhatsApp disconnected successfully" });
};

export const getTemplates = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.query as { businessId?: string };

  if (!businessId) {
    return res.status(400).json({ error: "businessId es requerido" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessWhatsApp(businessId);

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  return ApiResponse.success(res, {
    welcomeMessage: business.welcomeMessage,
    reminderMessage: business.reminderMessage,
  });
};

export const updateTemplates = async (req: AuthRequest, res: Response) => {
  const { businessId, welcomeMessage, reminderMessage } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const updated = await businessService.updateBusinessTemplates(businessId, {
    welcomeMessage,
    reminderMessage,
  });

  return ApiResponse.success(res, updated);
};

export default {
  initClient,
  getStatus,
  disconnectClient,
  getTemplates,
  updateTemplates,
};
