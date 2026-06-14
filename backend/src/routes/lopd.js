const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { validateId } = require('../middleware');
const { sendWelcomeMessage } = require('../bot');

router.get('/:id', validateId('id'), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { business: true }
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({
      clientName: client.name,
      businessName: client.business.name,
      lopdStatus: client.lopdStatus
    });
  } catch (err) {
    console.error('[API] Error fetching client LOPD details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/accept', validateId('id'), async (req, res) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Idempotency guard — already accepted, nothing to do
    if (client.lopdStatus === 'Aceptado') {
      console.log(`[API] Client ${client.name} already accepted LOPD. Skipping.`);
      return res.json({ success: true, client });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { lopdStatus: 'Aceptado' }
    });

    console.log(`[API] Client ${client.name} (${client.phone}) accepted LOPD consent. Status updated to Aceptado.`);

    const futureAppointments = await prisma.appointment.findMany({
      where: {
        clientId: id,
        appointmentDate: { gte: new Date() },
        status: 'PENDING'
      }
    });

    console.log(`[API] Found ${futureAppointments.length} future pending appointments for client ${id}. Triggering welcome messages...`);

    for (const appt of futureAppointments) {
      await sendWelcomeMessage(appt.id);
    }

    res.json({ success: true, client: updatedClient });
  } catch (err) {
    console.error('[API] Error accepting LOPD consent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
