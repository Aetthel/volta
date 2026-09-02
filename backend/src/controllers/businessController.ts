import * as businessService from "../services/businessService.js";
import { ApiResponse } from "../utils/index.js";
import {
  getHolidayCatalogue,
  getObservedHolidays,
  isKnownHolidayKey,
} from "../utils/holidays.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const HOLIDAY_YEARS_AHEAD = 1;

const defaultHours = [
  { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 6, openTime: "10:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true },
];

export const getBusiness = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  return ApiResponse.success(res, business);
};

export const updateBusiness = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const {
    name,
    email,
    phone,
    address,
    logoUrl,
    coverUrl,
    description,
    themeColor,
    fontSizeLevel,
    borderRadiusLevel,
  } = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const updateData: Record<string, any> = {};
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

export const getHours = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const hours = await businessService.getBusinessHours(id);
  if (hours.length === 0) {
    return ApiResponse.success(res, defaultHours);
  }

  return ApiResponse.success(res, hours);
};

export const getHolidays = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const preferences = await businessService.getBusinessHolidays(id);
  const currentYear = new Date().getFullYear();

  return ApiResponse.success(res, {
    holidays: getObservedHolidays(preferences, currentYear, currentYear + HOLIDAY_YEARS_AHEAD),
    catalogue: getHolidayCatalogue(preferences, currentYear),
  });
};

export const updateHolidays = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const holidaysData = req.body;

  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  const unknown = holidaysData.find((h: any) => !isKnownHolidayKey(h.holidayKey));
  if (unknown) {
    return res.status(400).json({ error: `Festivo no reconocido: ${unknown.holidayKey}` });
  }

  await businessService.updateBusinessHolidays(id, holidaysData);

  const preferences = await businessService.getBusinessHolidays(id);
  const currentYear = new Date().getFullYear();

  return ApiResponse.success(res, {
    holidays: getObservedHolidays(preferences, currentYear, currentYear + HOLIDAY_YEARS_AHEAD),
    catalogue: getHolidayCatalogue(preferences, currentYear),
  });
};

export const updateHours = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const hoursData = req.body;

  // Verify tenant isolation
  if (req.user?.role !== "ADMIN" && id !== req.user?.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const business = await businessService.getBusinessById(id);
  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (!Array.isArray(hoursData) || hoursData.length !== 7) {
    return res.status(400).json({ error: "Se deben proporcionar exactamente 7 días de horarios." });
  }

  await businessService.updateBusinessHours(id, hoursData);
  const updatedHours = await businessService.getBusinessHours(id);

  return ApiResponse.success(res, updatedHours);
};

export default {
  getBusiness,
  updateBusiness,
  getHours,
  getHolidays,
  updateHolidays,
  updateHours,
};
