const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(['ADMIN', 'JEFE', 'EMPLEADO']),
  businessId: z.string().optional().nullable()
});

const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de email no válido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().nullable(),
  role: z.enum(['ADMIN', 'JEFE', 'EMPLEADO']).optional(),
  businessId: z.string().optional().nullable()
});

// GET /api/users
router.get('/', authenticate, async (req, res) => {
  const { businessId } = req.query;
  try {
    const where = {};
    if (businessId && businessId !== 'null' && businessId !== 'undefined') {
      where.businessId = businessId;
    }

    // Force non-admins to only query their own business
    if (req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId || 'no_business';
    }
    
    const users = await prisma.user.findMany({
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
    
    // Map password out
    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    
    res.json(sanitizedUsers);
  } catch (err) {
    console.error('[API] Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users
router.post('/', authenticate, validateBody(createUserSchema), async (req, res) => {
  const { name, email, password, role, businessId } = req.body;
  try {
    // Check tenant isolation
    if (req.user.role !== 'ADMIN') {
      if (businessId && businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Forbidden: Access denied to other business ID' });
      }
      if (role === 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Cannot create ADMIN users' });
      }
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    if (existing) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        businessId: (req.user.role !== 'ADMIN' ? req.user.businessId : businessId) || null
      }
    });

    const { password: _, ...sanitized } = user;
    res.status(201).json(sanitized);
  } catch (err) {
    console.error('[API] Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, validateId('id'), validateBody(updateUserSchema), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, businessId } = req.body;
  try {
    // If not admin, check target user ownership and request params
    if (req.user.role !== 'ADMIN') {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (businessId && businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Forbidden: Cannot transfer user to another business' });
      }
      if (role === 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Cannot promote user to ADMIN' });
      }
    }

    const data = {};
    if (name) data.name = name;
    if (email) {
      // Check if email taken by someone else
      const existing = await prisma.user.findUnique({
        where: { email }
      });
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
      }
      data.email = email;
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (role) data.role = role;
    if (businessId !== undefined) {
      data.businessId = businessId || null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data
    });

    const { password: _, ...sanitized } = updated;
    res.json(sanitized);
  } catch (err) {
    console.error('[API] Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;
  try {
    // If not admin, check target user ownership
    if (req.user.role !== 'ADMIN') {
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.businessId !== req.user.businessId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    await prisma.user.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
