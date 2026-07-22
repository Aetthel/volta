import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const getUsers = async (where = {}) => {
  return prisma.user.findMany({
    where,
    include: {
      business: {
        select: {
          name: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id }
  });
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  return prisma.user.findFirst({
    where: {
      email: {
        equals: cleanEmail,
        mode: 'insensitive'
      }
    }
  });
};

export const createUser = async (userData) => {
  const data = { ...userData };
  if (data.password) {
    data.password = await hashPassword(data.password);
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
    data
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id }
  });
};
