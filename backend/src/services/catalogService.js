import prisma from '../config/db.js';

export const getServicesByBusiness = async (businessId, activeOnly = true) => {
  const where = { businessId };
  if (activeOnly) {
    where.isActive = true;
  }
  return prisma.service.findMany({
    where,
    orderBy: { name: 'asc' }
  });
};

export const getServiceById = async (id) => {
  return prisma.service.findUnique({
    where: { id }
  });
};

export const createService = async (serviceData) => {
  return prisma.service.create({
    data: {
      ...serviceData,
      description: serviceData.description || ''
    }
  });
};

export const updateService = async (id, updateData) => {
  return prisma.service.update({
    where: { id },
    data: updateData
  });
};

export const softDeleteService = async (id) => {
  return prisma.service.update({
    where: { id },
    data: { isActive: false }
  });
};
