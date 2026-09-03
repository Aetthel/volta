import * as catalogService from "../services/catalogService.js";
import * as businessService from "../services/businessService.js";
import { cacheService } from "../services/cacheService.js";
import { ApiResponse } from "../utils/index.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export const getServices = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.query as { businessId?: string };

  if (!businessId) {
    return res.status(400).json({ error: "businessId es requerido" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const cacheKey = `volta:cache:biz:${businessId}:services`;
  const cachedServices = await cacheService.get(cacheKey);
  if (cachedServices) {
    return ApiResponse.success(res, cachedServices);
  }

  const services = await catalogService.getServicesByBusiness(businessId, true);
  await cacheService.set(cacheKey, services, 300); // 5 min TTL
  return ApiResponse.success(res, services);
};

export const createService = async (req: AuthRequest, res: Response) => {
  const { businessId, name, description, duration, price, capacity, type, color } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessById(businessId);
  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  const PASTEL_COLOR_IDS = ["teal", "lavender", "rose", "amber", "sky", "purple", "coral"];
  let assignedColor = color;
  if (!assignedColor || assignedColor === "TEAL") {
    const existingServices = await catalogService.getServicesByBusiness(businessId, false);
    assignedColor = PASTEL_COLOR_IDS[existingServices.length % PASTEL_COLOR_IDS.length];
  }

  const service = await catalogService.createService({
    businessId,
    name,
    description,
    duration,
    price,
    capacity: capacity !== undefined ? parseInt(capacity, 10) : 1,
    type,
    color: assignedColor,
  });

  // Invalidate cache reactively
  await cacheService.del(`volta:cache:biz:${businessId}:services`);

  return ApiResponse.created(res, service);
};

export const updateService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, description, duration, price, capacity, type, color, isActive } = req.body;

  const service = await catalogService.getServiceById(id);
  if (!service) {
    return res.status(404).json({ error: "Servicio no encontrado" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && service.businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este servicio" });
  }

  const updatedData: any = { name, description, duration, price, type, color, isActive };
  if (capacity !== undefined) {
    updatedData.capacity = parseInt(capacity, 10);
  }

  const updated = await catalogService.updateService(id, updatedData);

  // Invalidate cache reactively
  await cacheService.del(`volta:cache:biz:${service.businessId}:services`);

  return ApiResponse.success(res, updated);
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const service = await catalogService.getServiceById(id);
  if (!service) {
    return res.status(404).json({ error: "Servicio no encontrado" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && service.businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este servicio" });
  }

  await catalogService.softDeleteService(id);

  // Invalidate cache reactively
  await cacheService.del(`volta:cache:biz:${service.businessId}:services`);

  return ApiResponse.deleted(res);
};

export default {
  getServices,
  createService,
  updateService,
  deleteService,
};
