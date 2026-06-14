const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const { z } = require('zod');

const createServiceSchema = z.object({
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  name: z.string().min(2, "El nombre de servicio debe tener al menos 2 caracteres"),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, "La duración debe ser al menos de 1 minuto"),
  price: z.number().min(0, "El precio debe ser un número positivo")
});

const updateServiceSchema = z.object({
  name: z.string().min(2, "El nombre de servicio debe tener al menos 2 caracteres").optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, "La duración debe ser al menos de 1 minuto").optional(),
  price: z.number().min(0, "El precio debe ser un número positivo").optional(),
  isActive: z.boolean().optional()
});

// GET active services for a business
router.get('/', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.query;

  try {
    const services = await prisma.service.findMany({
      where: { 
        businessId,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
    res.json(services);
  } catch (err) {
    console.error('[API] Error fetching services:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create a new service
router.post('/', authenticate, validateId('businessId'), validateBody(createServiceSchema), async (req, res) => {
  const { businessId, name, description, duration, price } = req.body;

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        description: description || '',
        duration,
        price
      }
    });

    res.status(201).json(service);
  } catch (err) {
    console.error('[API] Error creating service:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update a service
router.put('/:id', authenticate, validateId('id'), validateBody(updateServiceSchema), async (req, res) => {
  const { id } = req.params;
  const { name, description, duration, price, isActive } = req.body;

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        duration,
        price,
        isActive
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('[API] Error updating service:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE deactivate service (soft delete)
router.delete('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deactivating service:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
