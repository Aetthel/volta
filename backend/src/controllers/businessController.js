import * as businessService from '../services/businessService.js';
import { ApiResponse } from '../utils/index.js';

const defaultHours = [
  { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 6, openTime: "10:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true }
];

export const getBusiness = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  return ApiResponse.success(res, business);
};

export const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, logoUrl, coverUrl, description, themeColor, fontSizeLevel, borderRadiusLevel } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
  if (description !== undefined) updateData.description = description;
  if (themeColor !== undefined) updateData.themeColor = themeColor;
  if (fontSizeLevel !== undefined) updateData.fontSizeLevel = fontSizeLevel;
  if (borderRadiusLevel !== undefined) updateData.borderRadiusLevel = borderRadiusLevel;

  const updated = await businessService.updateBusiness(id, updateData);

  return ApiResponse.success(res, updated);
};

export const getHours = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const hours = await businessService.getBusinessHours(id);
  if (hours.length === 0) {
    return ApiResponse.success(res, defaultHours);
  }

  return ApiResponse.success(res, hours);
};

export const updateHours = async (req, res) => {
  const { id } = req.params;
  const hoursData = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Acceso denegado a este negocio' });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  if (!Array.isArray(hoursData) || hoursData.length !== 7) {
    return res.status(400).json({ error: 'Se deben proporcionar exactamente 7 días de horarios.' });
  }

  await businessService.updateBusinessHours(id, hoursData);
  const updatedHours = await businessService.getBusinessHours(id);

  return ApiResponse.success(res, updatedHours);
};
