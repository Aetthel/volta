import * as appointmentsService from '../services/appointmentsService.js';
import { ApiResponse } from '../utils/index.js';

export const getAppointments = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const appointments = await appointmentsService.getAppointmentsByBusiness(businessId);
  return ApiResponse.success(res, appointments);
};

export const createAppointment = async (req, res) => {
  const { businessId } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access to this business is not allowed' });
  }

  const appointment = await appointmentsService.createAppointment(req.body);
  return ApiResponse.created(res, appointment);
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && appt.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this appointment' });
  }

  const updated = await appointmentsService.updateAppointment(id, req.body, appt.businessId);
  return ApiResponse.success(res, updated);
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  const appt = await appointmentsService.getAppointmentById(id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && appt.businessId !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this appointment' });
  }

  await appointmentsService.deleteAppointment(id);
  return ApiResponse.deleted(res);
};
