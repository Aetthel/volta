import * as appointmentsService from '../services/appointmentsService.js';
import { ApiResponse } from '../utils/index.js';

export const getAppointments = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const appointments = await appointmentsService.getAppointmentsByBusiness(businessId);
  return ApiResponse.success(res, appointments);
};

export const createAppointment = async (req, res) => {
  const { clientName, clientPhone, appointmentDate, businessId, service } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const appointment = await appointmentsService.createAppointment({ clientName, clientPhone, appointmentDate, businessId, service });
  return ApiResponse.created(res, appointment);
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && appt.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a esta cita' });
  }

  const { clientName, clientPhone, appointmentDate, status, serviceName } = req.body;
  const updated = await appointmentsService.updateAppointment(id, { clientName, clientPhone, appointmentDate, status, serviceName }, appt.businessId);
  return ApiResponse.success(res, updated);
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && appt.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a esta cita' });
  }

  await appointmentsService.deleteAppointment(id);
  return ApiResponse.deleted(res);
};
