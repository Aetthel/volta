import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Campos que puede ver un miembro del salón al listar a sus compañeros.
 *
 * Es una lista blanca a propósito. Antes se devolvía la fila entera quitando
 * sólo `password`, y eso sacaba por la API el `twoFactorSecret` en claro —con lo
 * que cualquier empleado podía generar los códigos de su jefe—, además del
 * `otpCode` vivo y los tokens de recuperación. Declarando lo que sale, un campo
 * sensible nuevo en el modelo se queda dentro por defecto en vez de filtrarse
 * hasta que alguien se acuerde de añadirlo a una lista de exclusión.
 */
const TEAM_MEMBER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  emailVerified: true,
  twoFactorEnabled: true,
  businessId: true,
  createdAt: true,
  updatedAt: true,
  business: {
    select: {
      name: true,
    },
  },
};

export const getUsers = async (where = {}) => {
  return prisma.user.findMany({
    where,
    select: TEAM_MEMBER_FIELDS,
    orderBy: { name: "asc" },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  return prisma.user.findFirst({
    where: {
      email: {
        equals: cleanEmail,
        mode: "insensitive",
      },
    },
  });
};

export const createUser = async (userData) => {
  const data = { ...userData };
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  if (data.businessId) {
    const { businessId, ...rest } = data;
    return prisma.user.create({
      data: {
        ...rest,
        business: { connect: { id: businessId } },
      },
    });
  }
  return prisma.user.create({ data });
};

export const updateUser = async (id, updateData) => {
  const data = { ...updateData };
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
