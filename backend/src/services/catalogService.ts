import prisma from "../config/db.js";
import type { CreateServiceInput, UpdateServiceInput } from "../validators/index.js";

export const getServicesByBusiness = async (businessId: string, activeOnly = true) => {
  const where: { businessId: string; isActive?: boolean } = { businessId };
  if (activeOnly) {
    where.isActive = true;
  }
  return prisma.service.findMany({
    where,
    orderBy: { name: "asc" },
  });
};

export const getServiceById = async (id: string) => {
  return prisma.service.findUnique({
    where: { id },
  });
};

export const createService = async (serviceData: CreateServiceInput) => {
  return prisma.service.create({
    data: {
      ...serviceData,
      description: serviceData.description || "",
    },
  });
};

export const updateService = async (id: string, updateData: UpdateServiceInput) => {
  return prisma.service.update({
    where: { id },
    data: updateData,
  });
};

export const softDeleteService = async (id: string) => {
  return prisma.service.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  getServicesByBusiness,
  getServiceById,
  createService,
  updateService,
  softDeleteService,
};
