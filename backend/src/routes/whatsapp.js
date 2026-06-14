const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const whatsappManager = require('../whatsapp');
const { z } = require('zod');

const templateSchema = z.object({
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  welcomeMessage: z.string().max(1000, "El mensaje de bienvenida no puede superar los 1000 caracteres").optional().nullable(),
  reminderMessage: z.string().max(1000, "El mensaje de recordatorio no puede superar los 1000 caracteres").optional().nullable()
});

router.post('/init', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.body;

  try {
    await whatsappManager.initClient(businessId);
    res.json({ success: true, message: 'WhatsApp initialization started' });
  } catch (err) {
    console.error('[API] Error initializing WhatsApp client:', err);
    res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
  }
});

router.get('/status', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.query;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        whatsappStatus: true,
        qrCode: true
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      status: business.whatsappStatus,
      qrCode: business.qrCode
    });
  } catch (err) {
    console.error('[API] Error fetching WhatsApp status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/disconnect', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.body;

  try {
    const client = whatsappManager.getClient(businessId);
    if (client) {
      try {
        await client.destroy();
      } catch (destroyErr) {
        console.error('[API] Warning: error during client destroy:', destroyErr);
      }
      whatsappManager.clients.delete(businessId);
    }
    whatsappManager.deleteSession(businessId);
    await whatsappManager.updateStatus(businessId, 'DISCONNECTED', null);
    res.json({ success: true, message: 'WhatsApp disconnected successfully' });
  } catch (err) {
    console.error('[API] Error disconnecting WhatsApp client:', err);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp client' });
  }
});

router.get('/templates', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.query;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        welcomeMessage: true,
        reminderMessage: true
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      welcomeMessage: business.welcomeMessage,
      reminderMessage: business.reminderMessage
    });
  } catch (err) {
    console.error('[API] Error fetching templates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/templates', authenticate, validateId('businessId'), validateBody(templateSchema), async (req, res) => {
  const { businessId, welcomeMessage, reminderMessage } = req.body;

  try {
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        welcomeMessage,
        reminderMessage
      },
      select: {
        welcomeMessage: true,
        reminderMessage: true
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('[API] Error updating templates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
