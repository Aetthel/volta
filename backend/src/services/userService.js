import prisma from '../config/db.js';

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
  return prisma.user.findUnique({
    where: { email }
  });
};

export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData
  });
};

export const updateUser = async (id, updateData) => {
  return prisma.user.update({
    where: { id },
    data: updateData
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id }
  });
};
