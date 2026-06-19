const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const { z } = require('zod');
const { sendWelcomeMessage, sendConsentMessage } = require('../bot');
const { normalizeString, normalizePhone } = require('../utils');

const appointmentSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientPhone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  appointmentDate: z.string(), // Accept any valid date parseable string (we will parse to Date object)
  businessId: z.string().min(1, "El ID de negocio es requerido"),
  service: z.string().optional()
});

router.get('/', authenticate, validateId('businessId'), async (req, res) => {
  const { businessId } = req.query;

  try {
    const appointments = await prisma.appointment.findMany({
      where: { businessId },
      include: { client: true },
      orderBy: { appointmentDate: 'asc' }
    });
    res.json(appointments);
  } catch (err) {
    console.error('[API] Error fetching appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, validateId('businessId'), validateBody(appointmentSchema), async (req, res) => {
  const { clientName, clientPhone, appointmentDate, businessId } = req.body;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const clients = await prisma.client.findMany({
      where: { businessId }
    });

    const inputName = normalizeString(clientName);
    const inputPhone = normalizePhone(clientPhone);

    let client = clients.find((c) => {
      const existingName = normalizeString(`${c.name} ${c.surname || ""}`);
      const existingPhone = normalizePhone(c.phone);
      return existingName === inputName || existingPhone === inputPhone;
    });

    if (!client) {
      const parts = clientName.trim().split(" ");
      const firstName = parts[0];
      const surname = parts.slice(1).join(" ");

      client = await prisma.client.create({
        data: {
          name: firstName,
          surname: surname || "",
          email: `${normalizeString(firstName)}${surname ? "." + normalizeString(surname).split(" ")[0] : ""}@email.com`,
          phone: clientPhone,
          lopdStatus: "Pendiente",
          businessId,
          frequentService: req.body.service || req.body.serviceName || null,
          lastVisit: "Hoy"
        }
      });
      console.log(`[API] Automatically registered new LOPD-pending client: ${firstName} ${surname || ""}`);
    }

    // Look up service by name to store ID and Name
    let serviceId = null;
    let serviceName = req.body.service || null;

    if (serviceName) {
      const dbService = await prisma.service.findFirst({
        where: {
          businessId,
          name: serviceName,
          isActive: true
        }
      });
      if (dbService) {
        serviceId = dbService.id;
        serviceName = dbService.name;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        appointmentDate: new Date(appointmentDate),
        businessId,
        clientId: client.id,
        serviceId,
        serviceName,
        status: 'PENDING'
      }
    });

    if (client.lopdStatus === 'Aceptado') {
      sendWelcomeMessage(appointment.id).catch((err) => {
        console.error('[API] Error sending welcome message on appointment creation:', err);
      });
    } else {
      sendConsentMessage(businessId, client).catch((err) => {
        console.error('[API] Error sending LOPD consent request:', err);
      });
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error('[API] Error creating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const updateAppointmentSchema = z.object({
  clientName: z.string().min(2).optional(),
  clientPhone: z.string().regex(/^\+?[0-9\s-]{9,20}$/).optional(),
  appointmentDate: z.string().optional(),
  status: z.enum(['PENDING', 'SENT', 'ERROR']).optional(),
  serviceName: z.string().optional().nullable(),
});

router.put('/:id', authenticate, validateId('id'), validateBody(updateAppointmentSchema), async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify tenant isolation
    if (req.user.role !== 'ADMIN' && existing.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this appointment' });
    }

    const data = {};
    if (updateData.clientName) data.clientName = updateData.clientName;
    if (updateData.clientPhone) data.clientPhone = updateData.clientPhone;
    if (updateData.appointmentDate) data.appointmentDate = new Date(updateData.appointmentDate);
    if (updateData.status) data.status = updateData.status;
    if (updateData.serviceName !== undefined) {
      data.serviceName = updateData.serviceName;
      // Also look up serviceId
      if (updateData.serviceName) {
        const dbService = await prisma.service.findFirst({
          where: {
            businessId: existing.businessId,
            name: updateData.serviceName,
            isActive: true
          }
        });
        if (dbService) {
          data.serviceId = dbService.id;
        } else {
          data.serviceId = null;
        }
      } else {
        data.serviceId = null;
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (err) {
    console.error('[API] Error updating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify tenant isolation
    if (req.user.role !== 'ADMIN' && existing.businessId !== req.user.businessId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this appointment' });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deleting appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
