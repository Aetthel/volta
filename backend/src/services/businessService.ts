import prisma from "../config/db.js";
import type { BusinessHolidayPreference } from "../utils/holidays.js";
import type { UpdateBusinessInput, UpdateHoursInput } from "../validators/index.js";

export const getBusinessById = async (id: string) => {
  return prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      whatsappStatus: true,
      qrCode: true,
      themeColor: true,
      fontSizeLevel: true,
      borderRadiusLevel: true,
    },
  });
};

export const updateBusiness = async (id: string, updateData: UpdateBusinessInput) => {
  return prisma.business.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      themeColor: true,
      fontSizeLevel: true,
      borderRadiusLevel: true,
    },
  });
};

export const getBusinessHours = async (businessId: string) => {
  return prisma.businessHours.findMany({
    where: { businessId },
    orderBy: { dayOfWeek: "asc" },
  });
};

/** Excepciones del negocio al catálogo de festivos. Sin filas = todo por defecto. */
export const getBusinessHolidays = async (businessId: string) => {
  return prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });
};

export const updateBusinessHolidays = async (
  businessId: string,
  holidaysData: BusinessHolidayPreference[]
) => {
  return prisma.$transaction(async (tx) => {
    for (const holiday of holidaysData) {
      await tx.businessHoliday.upsert({
        where: {
          businessId_holidayKey: {
            businessId,
            holidayKey: holiday.holidayKey,
          },
        },
        update: { isObserved: holiday.isObserved },
        create: {
          businessId,
          holidayKey: holiday.holidayKey,
          isObserved: holiday.isObserved,
        },
      });
    }
  });
};

export const updateBusinessHours = async (
  businessId: string,
  hoursData: UpdateHoursInput
) => {
  return prisma.$transaction(async (tx) => {
    for (const h of hoursData) {
      await tx.businessHours.upsert({
        where: {
          businessId_dayOfWeek: {
            businessId,
            dayOfWeek: h.dayOfWeek,
          },
        },
        update: {
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        },
        create: {
          businessId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        },
      });
    }
  });
};

export const getBusinessWhatsApp = async (businessId: string) => {
  return prisma.business.findUnique({
    where: { id: businessId },
    select: {
      whatsappStatus: true,
      qrCode: true,
      welcomeMessage: true,
      reminderMessage: true,
    },
  });
};

export const updateBusinessTemplates = async (
  businessId: string,
  data: { welcomeMessage?: string | null; reminderMessage?: string | null }
) => {
  return prisma.business.update({
    where: { id: businessId },
    data,
    select: {
      welcomeMessage: true,
      reminderMessage: true,
    },
  });
};

export default {
  getBusinessById,
  updateBusiness,
  getBusinessHours,
  getBusinessHolidays,
  updateBusinessHolidays,
  updateBusinessHours,
  getBusinessWhatsApp,
  updateBusinessTemplates,
};
