import * as userService from '../services/userService.js';
import { ApiResponse } from '../utils/index.js';

export const getUsers = async (req, res) => {
  const { businessId } = req.query;
  const where = {};

  if (businessId && businessId !== 'null' && businessId !== 'undefined') {
    where.businessId = businessId;
  }

  // Force non-admins to only query their own business
  if (req.user.role !== 'ADMIN') {
    where.businessId = req.user.businessId || 'no_business';
  }

  const users = await userService.getUsers(where);

  // Map password out
  const sanitizedUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });

  return ApiResponse.success(res, sanitizedUsers);
};

export const createUser = async (req, res) => {
  const { name, email, password, role, businessId } = req.body;

  // Check tenant isolation
  if (req.user.role !== 'ADMIN') {
    if (businessId && businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Acceso denegado a otro negocio' });
    }
    if (role === 'ADMIN' || role === 'JEFE') {
      return res.status(403).json({ error: 'No se pueden crear usuarios ADMIN o JEFE' });
    }
  }

  // Check if email already exists
  const existing = await userService.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
  }

  const user = await userService.createUser({
    name,
    email,
    password,
    role,
    businessId: (req.user.role !== 'ADMIN' ? req.user.businessId : businessId) || null
  });

  const { password: _, ...sanitized } = user;
  return ApiResponse.created(res, sanitized);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, businessId } = req.body;

  // If not admin, check target user ownership and request params
  if (req.user.role !== 'ADMIN') {
    const targetUser = await userService.getUserById(id);
    if (!targetUser || targetUser.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (businessId !== undefined && businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'No se puede transferir usuario a otro negocio' });
    }
    if (role === 'ADMIN') {
      return res.status(403).json({ error: 'No se puede promover usuario a ADMIN' });
    }
    if (role === 'JEFE') {
      return res.status(403).json({ error: 'No se puede promover usuario a JEFE' });
    }
  }

  const data = {};
  if (name) data.name = name;
  if (email) {
    // Check if email taken by someone else
    const existing = await userService.getUserByEmail(email);
    if (existing && existing.id !== id) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
    }
    data.email = email;
  }
  if (password) {
    data.password = password;
  }
  if (role) data.role = role;
  if (businessId !== undefined) {
    data.businessId = businessId;
  }

  const updated = await userService.updateUser(id, data);

  const { password: _, ...sanitized } = updated;
  return ApiResponse.success(res, sanitized);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  // If not admin, check target user ownership
  if (req.user.role !== 'ADMIN') {
    const targetUser = await userService.getUserById(id);
    if (!targetUser || targetUser.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
  }

  await userService.deleteUser(id);
  return ApiResponse.deleted(res);
};
