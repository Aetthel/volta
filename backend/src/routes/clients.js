const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const { z } = require('zod');
const { sendConsentMessage } = require('../bot');

const createClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  surname: z.string().optional().nullable(),
  email: z.string().email("Formato de email no válido").optional().nullable().or(z.string().length(0)),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  businessId: z.string().min(1, "El ID de negocio es requerido")
});

const updateClientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  surname: z.string().optional().nullable(),
  email: z.string().email("Formato de email no válido").optional().nullable().or(z.string().length(0)),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido").optional(),
  lopdStatus: z.string().optional(),
  lastVisit: z.string().optional().nullable(),
  frequentService: z.string().optional().nullable()
});

router.get('/', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.query;

  try {
    const clients = await prisma.client.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (err) {
    console.error('[API] Error fetching clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, validateId('businessId'), validateBody(createClientSchema), async (req, res) => {
  const { name, surname, email, phone, businessId } = req.body;

  try {
    const client = await prisma.client.create({
      data: {
        name,
        surname: surname || "",
        email,
        phone,
        lopdStatus: "Pendiente",
        businessId
      }
    });

    sendConsentMessage(businessId, client).catch((err) => {
      console.error('[API] Error sending LOPD consent request:', err);
    });

    res.status(201).json(client);
  } catch (err) {
    console.error('[API] Error creating client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, validateId('id'), validateBody(updateClientSchema), async (req, res) => {
  const { id } = req.params;
  const { name, surname, email, phone, lopdStatus, lastVisit, frequentService } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        surname,
        email,
        phone,
        lopdStatus,
        lastVisit,
        frequentService
      }
    });
    res.json(client);
  } catch (err) {
    console.error('[API] Error updating client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.appointment.updateMany({
      where: { clientId: id },
      data: { clientId: null }
    });

    await prisma.client.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deleting client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/resend-consent', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    sendConsentMessage(client.businessId, client).catch((err) => {
      console.error('[API] Error resending LOPD consent request:', err);
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error resending consent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/send-message', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'El campo message es requerido y no puede estar vacío.' });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const whatsappManager = require('../whatsapp');
    await whatsappManager.sendMessage(client.businessId, client.phone, message.trim());
    console.log(`[WhatsApp] Custom message sent to ${client.phone}`);

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error sending custom message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
