import * as classSchedulesService from "../services/classSchedulesService.js";
import { ApiResponse } from "../utils/index.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

/** Un JEFE solo opera sobre las clases de su propio negocio; ADMIN pasa siempre. */
const deniesTenant = (req: AuthRequest, businessId: string) =>
  req.user?.role !== "ADMIN" && businessId !== req.user?.businessId;

export const getClassSchedules = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.query as { businessId?: string };

  if (!businessId) {
    return res.status(400).json({ error: "businessId es requerido" });
  }

  if (deniesTenant(req, businessId)) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const schedules = await classSchedulesService.listClassSchedules(businessId);
  return ApiResponse.success(res, schedules);
};

export const createClassSchedule = async (req: AuthRequest, res: Response) => {
  const { businessId } = req.body as { businessId: string };

  if (deniesTenant(req, businessId)) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const result = await classSchedulesService.createClassSchedule(req.body);
  return ApiResponse.created(res, result);
};

export const updateClassSchedule = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const schedule = await classSchedulesService.getClassScheduleById(id);
  if (!schedule) {
    return res.status(404).json({ error: "Clase semanal no encontrada" });
  }

  if (deniesTenant(req, schedule.businessId)) {
    return res.status(403).json({ error: "Acceso denegado a esta clase" });
  }

  const updated = await classSchedulesService.updateClassSchedule(id, req.body);
  return ApiResponse.success(res, updated);
};

export const deleteClassSchedule = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const schedule = await classSchedulesService.getClassScheduleById(id);
  if (!schedule) {
    return res.status(404).json({ error: "Clase semanal no encontrada" });
  }

  if (deniesTenant(req, schedule.businessId)) {
    return res.status(403).json({ error: "Acceso denegado a esta clase" });
  }

  const result = await classSchedulesService.deleteClassSchedule(id);
  return ApiResponse.success(res, result);
};

export default {
  getClassSchedules,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
};
