import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import type { CreateUserInput, UpdateUserInput } from "../validators/index.js";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * Campos que puede ver un miembro del salón al listar a sus compañeros.
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
} as const;

export const getUsers = async (where: Record<string, any> = {}) => {
  return prisma.user.findMany({
    where,
    select: TEAM_MEMBER_FIELDS,
    orderBy: { name: "asc" },
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const getUserByEmail = async (email?: string | null) => {
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

export const createUser = async (userData: CreateUserInput & { [key: string]: any }) => {
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
      } as any,
    });
  }
  return prisma.user.create({ data: data as any });
};

export const updateUser = async (id: string, updateData: UpdateUserInput & { [key: string]: any }) => {
  const data = { ...updateData };
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return prisma.user.update({
    where: { id },
    data: data as any,
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

export default {
  hashPassword,
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
