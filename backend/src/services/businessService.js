import prisma from "../config/db.js";

export const getBusinessById = async (id) => {
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

export const updateBusiness = async (id, updateData) => {
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

export const getBusinessHours = async (businessId) => {
  return prisma.businessHours.findMany({
    where: { businessId },
    orderBy: { dayOfWeek: "asc" },
  });
};

/** Excepciones del negocio al catálogo de festivos. Sin filas = todo por defecto. */
export const getBusinessHolidays = async (businessId) => {
  return prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });
};

export const updateBusinessHolidays = async (businessId, holidaysData) => {
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

export const updateBusinessHours = async (businessId, hoursData) => {
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

export const getBusinessWhatsApp = async (businessId) => {
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

export const updateBusinessTemplates = async (businessId, data) => {
  return prisma.business.update({
    where: { id: businessId },
    data,
    select: {
      welcomeMessage: true,
      reminderMessage: true,
    },
  });
};
