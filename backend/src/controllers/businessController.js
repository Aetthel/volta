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
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  return ApiResponse.success(res, business);
};

export const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, logoUrl, coverUrl, description, ownerName, themeColor, fontSizeLevel, borderRadiusLevel } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  const updated = await businessService.updateBusiness(id, {
    name,
    email,
    phone,
    address,
    logoUrl,
    coverUrl,
    description,
    ownerName,
    themeColor,
    fontSizeLevel,
    borderRadiusLevel
  });

  return ApiResponse.success(res, updated);
};

export const getHours = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
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
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  await businessService.updateBusinessHours(id, hoursData);
  const updatedHours = await businessService.getBusinessHours(id);

  return ApiResponse.success(res, updatedHours);
};
