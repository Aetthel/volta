const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const { z } = require('zod');

const updateBusinessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Formato de email no válido").optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido").optional(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  themeColor: z.string().optional(),
  fontSizeLevel: z.string().optional(),
  borderRadiusLevel: z.string().optional()
});

router.get('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;
  
  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        coverUrl: true,
        description: true,
        ownerName: true,
        whatsappStatus: true,
        qrCode: true,
        themeColor: true,
        fontSizeLevel: true,
        borderRadiusLevel: true,
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
  const { name, email, phone, address, logoUrl, coverUrl, description, ownerName, themeColor, fontSizeLevel, borderRadiusLevel } = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  try {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        logoUrl,
        coverUrl,
        description,
        ownerName,
        themeColor,
        fontSizeLevel,
        borderRadiusLevel
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        coverUrl: true,
        description: true,
        ownerName: true,
        themeColor: true,
        fontSizeLevel: true,
        borderRadiusLevel: true,
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('[API] Error updating business:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const defaultHours = [
  { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 6, openTime: "10:00", closeTime: "18:00", isClosed: false },
  { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true }
];

const updateHoursSchema = z.array(z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
  isClosed: z.boolean()
}));

router.get('/:id/hours', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  try {
    const hours = await prisma.businessHours.findMany({
      where: { businessId: id },
      orderBy: { dayOfWeek: 'asc' }
    });
    if (hours.length === 0) {
      return res.json(defaultHours);
    }
    res.json(hours);
  } catch (err) {
    console.error('[API] Error fetching business hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/hours', authenticate, validateId('id'), validateBody(updateHoursSchema), async (req, res) => {
  const { id } = req.params;
  const hoursData = req.body;

  // Verify tenant isolation
  if (req.user.role !== 'ADMIN' && id !== req.user.businessId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to other business' });
  }

  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await prisma.$transaction(async (tx) => {
      for (const h of hoursData) {
        await tx.businessHours.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId: id,
              dayOfWeek: h.dayOfWeek
            }
          },
          update: {
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed
          },
          create: {
            businessId: id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed
          }
        });
      }
    });

    const updatedHours = await prisma.businessHours.findMany({
      where: { businessId: id },
      orderBy: { dayOfWeek: 'asc' }
    });
    res.json(updatedHours);
  } catch (err) {
    console.error('[API] Error updating business hours:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
