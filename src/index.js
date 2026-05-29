require('dotenv').config();
const express = require('express');
const prisma = require('./db');

const cron = require('node-cron');
const { runSentinel } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Schedule the Sentinel to run every day at 20:00
cron.schedule('0 20 * * *', () => {
  runSentinel();
});

app.use(express.json());

/**
 * Middleware to protect routes with a static API Key
 */
const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Endpoint to insert a new appointment
 */
app.post('/api/appointments', authenticate, async (req, res) => {
  const { clientName, clientPhone, appointmentDate, businessId } = req.body;

  // Basic validation
  if (!clientName || !clientPhone || !appointmentDate || !businessId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        appointmentDate: new Date(appointmentDate),
        businessId,
        status: 'PENDING'
      }
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('[API] Error creating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server (only if not required as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[API] Server running on port ${PORT}`);
  });
}

module.exports = app;
