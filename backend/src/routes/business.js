const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const { z } = require('zod');

const updateBusinessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de email no válido").optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido").optional(),
  address: z.string().optional().nullable()
});

router.get('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      }
    });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(business);
  } catch (err) {
    console.error('[API] Error fetching business:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, validateId('id'), validateBody(updateBusinessSchema), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('[API] Error updating business:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
