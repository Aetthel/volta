import * as appointmentsService from "../services/appointmentsService.js";
import { ApiResponse } from "../utils/index.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export const getAppointments = async (req: AuthRequest, res: Response) => {
  const { businessId, startDate, endDate } = req.query as {
    businessId?: string;
    startDate?: string;
    endDate?: string;
  };

  if (!businessId) {
    return res.status(400).json({ error: "businessId es requerido" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  // Rango opcional. Se rechaza una fecha ilegible en lugar de ignorarla: pasar un
  // `Invalid Date` a Prisma haría fallar la consulta con un error opaco, y aceptarla
  // en silencio devolvería un histórico completo que quien llama no espera.
  const range: { startDate?: Date; endDate?: Date } = {};
  for (const [clave, valor] of [
    ["startDate", startDate],
    ["endDate", endDate],
  ] as const) {
    if (valor === undefined) continue;
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      return res.status(400).json({ error: `${clave} no es una fecha válida` });
    }
    range[clave] = fecha;
  }

  if (range.startDate && range.endDate && range.startDate > range.endDate) {
    return res.status(400).json({ error: "startDate no puede ser posterior a endDate" });
  }

  const appointments = await appointmentsService.getAppointmentsByBusiness(businessId, range);
  return ApiResponse.success(res, appointments);
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  const { clientName, clientPhone, appointmentDate, businessId, service } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const appointment = await appointmentsService.createAppointment({
    clientName,
    clientPhone,
    appointmentDate,
    businessId,
    service,
  });
  return ApiResponse.created(res, appointment);
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && appt.businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a esta cita" });
  }

  const { clientName, clientPhone, appointmentDate, status, serviceName, serviceId, attended } = req.body;
  const updated = await appointmentsService.updateAppointment(
    id,
    { clientName, clientPhone, appointmentDate, status, serviceName, serviceId, attended },
    appt.businessId
  );
  return ApiResponse.success(res, updated);
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && appt.businessId !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a esta cita" });
  }

  await appointmentsService.deleteAppointment(id);
  return ApiResponse.deleted(res);
};

export default {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
