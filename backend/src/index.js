const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const prisma = require('./db');

const cron = require('node-cron');
const { runSentinel, sendWelcomeMessage } = require('./bot');

const app = express();
const PORT = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 3001);
const API_KEY = process.env.API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Schedule the Sentinel to run every day at 20:00
cron.schedule('0 20 * * *', () => {
  runSentinel();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
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

// Normalization Helper Functions
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length > 9) {
    return digits.slice(2);
  }
  return digits;
};

/**
 * Endpoint to get all appointments for a business
 */
app.get('/api/appointments', authenticate, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter' });
  }

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

    // Auto-save client if they don't already exist under this business
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

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        appointmentDate: new Date(appointmentDate),
        businessId,
        clientId: client.id,
        status: 'PENDING'
      }
    });

    // Send welcome message or LOPD consent request (Task 1.4)
    if (client.lopdStatus === 'Aceptado') {
      sendWelcomeMessage(appointment.id).catch((err) => {
        console.error('[API] Error sending welcome message on appointment creation:', err);
      });
    } else {
      const consentUrl = `${FRONTEND_URL}/lopd/${client.id}`;
      const consentMessage = `¡Hola ${client.name}! Para cumplir con la LOPD y poder enviarte recordatorios de tus citas por WhatsApp, por favor acepta nuestra política de privacidad aquí: ${consentUrl}`;
      console.log(`[Bot] Triggering automatic LOPD consent message for ${client.name} (${client.phone})...`);
      
      const whatsappManager = require('./whatsapp');
      // Asynchronous to avoid blocking the HTTP response
      (async () => {
        try {
          if (whatsappManager.getClient(businessId)) {
            await whatsappManager.sendMessage(businessId, client.phone, consentMessage);
            console.log(`[WhatsApp] Auto LOPD consent message sent to ${client.phone}`);
          } else {
            console.log(`[WhatsApp] Simulated auto LOPD send (bot not active): ${consentMessage}`);
          }
        } catch (wsErr) {
          console.error(`[WhatsApp] Failed to send auto LOPD consent message to ${client.phone}:`, wsErr);
        }
      })();
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error('[API] Error creating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Endpoint to get all clients for a business
 */
app.get('/api/clients', authenticate, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter' });
  }

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

/**
 * Endpoint to create a client manually
 */
app.post('/api/clients', authenticate, async (req, res) => {
  const { name, surname, email, phone, businessId } = req.body;

  if (!name || !phone || !businessId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        surname: surname || "",
        email,
        phone,
        lopdStatus: "Pendiente", // Manually added clients default to Pendiente for LOPD consent flow
        businessId
      }
    });
    // Send LOPD consent message automatically (Task 1.4 equivalent for manual registration)
    const consentUrl = `${FRONTEND_URL}/lopd/${client.id}`;
    const consentMessage = `¡Hola ${client.name}! Para cumplir con la LOPD y poder enviarte recordatorios de tus citas por WhatsApp, por favor acepta nuestra política de privacidad aquí: ${consentUrl}`;
    console.log(`[Bot] Triggering automatic LOPD consent message for manually created client ${client.name} (${client.phone})...`);
    
    const whatsappManager = require('./whatsapp');
    (async () => {
      try {
        if (whatsappManager.getClient(businessId)) {
          await whatsappManager.sendMessage(businessId, client.phone, consentMessage);
          console.log(`[WhatsApp] Auto LOPD consent message sent to ${client.phone}`);
        } else {
          console.log(`[WhatsApp] Simulated auto LOPD send (bot not active): ${consentMessage}`);
        }
      } catch (wsErr) {
        console.error(`[WhatsApp] Failed to send auto LOPD consent message to ${client.phone}:`, wsErr);
      }
    })();

    res.status(201).json(client);
  } catch (err) {
    console.error('[API] Error creating client:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to edit an existing client
 */
app.put('/api/clients/:id', authenticate, async (req, res) => {
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

/**
 * Endpoint to delete an existing client
 */
app.delete('/api/clients/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Set clientId to null on any linked appointments
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

/**
 * Endpoint to resend/simulate LOPD consent via WhatsApp
 */
app.post('/api/clients/:id/resend-consent', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const consentUrl = `${FRONTEND_URL}/lopd/${client.id}`;
    const message = `¡Hola ${client.name}! Para cumplir con la LOPD y enviarte recordatorios, por favor acepta nuestra política de privacidad aquí: ${consentUrl}`;
    
    console.log(`[Bot] Sending LOPD consent WhatsApp to ${client.phone}: ${message}`);
    
    try {
      const whatsappManager = require('./whatsapp');
      if (whatsappManager.getClient(client.businessId)) {
        await whatsappManager.sendMessage(client.businessId, client.phone, message);
        console.log(`[WhatsApp] Consent message sent successfully to ${client.phone}`);
      }
    } catch (wsErr) {
      console.log(`[WhatsApp] Simulated send (bot not active): ${message}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error resending consent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to send custom WhatsApp message to a client
 */
app.post('/api/clients/:id/send-message', authenticate, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log(`[Bot] Sending custom WhatsApp to ${client.phone}: ${message}`);
    
    try {
      const whatsappManager = require('./whatsapp');
      if (whatsappManager.getClient(client.businessId)) {
        await whatsappManager.sendMessage(client.businessId, client.phone, message);
        console.log(`[WhatsApp] Custom message sent successfully to ${client.phone}`);
      }
    } catch (wsErr) {
      console.log(`[WhatsApp] Simulated send (bot not active): ${message}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error sending custom message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to initialize a WhatsApp-Web session for a business
 */
app.post('/api/whatsapp/init', authenticate, async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId in request body' });
  }

  try {
    const whatsappManager = require('./whatsapp');
    await whatsappManager.initClient(businessId);
    res.json({ success: true, message: 'WhatsApp initialization started' });
  } catch (err) {
    console.error('[API] Error initializing WhatsApp client:', err);
    res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
  }
});

/**
 * Endpoint to get WhatsApp connection status and current QR code
 */
app.get('/api/whatsapp/status', authenticate, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter' });
  }

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

/**
 * Endpoint to disconnect and destroy WhatsApp session
 */
app.post('/api/whatsapp/disconnect', authenticate, async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId in request body' });
  }

  try {
    const whatsappManager = require('./whatsapp');
    const client = whatsappManager.getClient(businessId);
    if (client) {
      try {
        await client.destroy();
      } catch (destroyErr) {
        console.error('[API] Warning: error during client destroy:', destroyErr);
      }
      whatsappManager.clients.delete(businessId);
    }
    await whatsappManager.updateStatus(businessId, 'DISCONNECTED', null);
    res.json({ success: true, message: 'WhatsApp disconnected successfully' });
  } catch (err) {
    console.error('[API] Error disconnecting WhatsApp client:', err);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp client' });
  }
});

/**
 * Endpoint to get message templates for a business
 */
app.get('/api/whatsapp/templates', authenticate, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter' });
  }

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

/**
 * Endpoint to update message templates for a business
 */
app.post('/api/whatsapp/templates', authenticate, async (req, res) => {
  const { businessId, welcomeMessage, reminderMessage } = req.body;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId in request body' });
  }

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


/**
 * Public endpoint to get client and business details for LOPD consent page (unauthenticated)
 */
app.get('/api/lopd/:id', async (req, res) => {
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

/**
 * Public endpoint to accept LOPD consent for a client (unauthenticated)
 */
app.post('/api/lopd/:id/accept', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.findUnique({

      where: { id },
      include: { business: true }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update status to Aceptado
    const updatedClient = await prisma.client.update({
      where: { id },
      data: { lopdStatus: 'Aceptado' }
    });

    console.log(`[API] Client ${client.name} (${client.phone}) accepted LOPD consent. Status updated to Aceptado.`);

    // Retroactively send welcome message for future appointments (Task 1.6)
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

/**
 * Endpoint to get business details
 */
app.get('/api/business/:id', authenticate, async (req, res) => {

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

/**
 * Endpoint to update business details
 */
app.put('/api/business/:id', authenticate, async (req, res) => {
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

/**
 * Endpoint to get all registered businesses (salons)
 */
app.get('/api/admin/businesses', authenticate, async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(businesses);
  } catch (err) {
    console.error('[API] Error fetching admin businesses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to create a new business account
 */
app.post('/api/admin/businesses', authenticate, async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password || '123456', 10);
    const business = await prisma.business.create({
      data: {
        name,
        email,
        phone,
        address: address || '',
        password: hashedPass,
        role: 'BUSINESS',
      }
    });
    res.json(business);
  } catch (err) {
    console.error('[API] Error creating business account:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to delete a business and cascade delete its appointments and clients
 */
app.delete('/api/admin/businesses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.deleteMany({ where: { businessId: id } });
    await prisma.client.deleteMany({ where: { businessId: id } });
    await prisma.business.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deleting business:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to get global admin dashboard statistics
 */
app.get('/api/admin/dashboard', authenticate, async (req, res) => {
  try {
    const servicePrices = {
      "Corte Caballero": 35,
      "Corte Dama": 45,
      "Coloración Premium": 85,
      "Tratamiento Keratina": 50,
      "Manicura": 20,
      "Spa Facial": 40,
    };

    const businesses = await prisma.business.findMany({
      where: { role: 'BUSINESS' },
      include: {
        appointments: true,
        clients: true,
      }
    });

    const totalClients = await prisma.client.count();
    
    // Calculate total revenue and ranking for each business
    let totalRevenue = 0;
    const rankings = businesses.map((b) => {
      const bizRevenue = b.appointments.reduce((acc, app) => {
        // Find if client frequent service is set, or assume standard price
        const serviceName = app.client?.frequentService || "Corte Caballero";
        const price = servicePrices[serviceName] || 35;
        return acc + price;
      }, 0);
      
      totalRevenue += bizRevenue;

      return {
        name: b.name,
        revenue: bizRevenue,
        clientsCount: b.clients.length,
      };
    });

    // Sort by revenue descending
    rankings.sort((a, b) => b.revenue - a.revenue);

    const formattedRankings = rankings.map((r, idx) => ({
      rank: idx + 1,
      name: r.name,
      revenue: `€${r.revenue.toLocaleString()}`,
      change: `+${Math.floor(Math.random() * 6) + 4}%`, // Visual trend percentage
    }));

    // Average ticket
    const totalAppointments = await prisma.appointment.count();
    const averageTicket = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 35;

    res.json({
      totalRevenue: `€${totalRevenue.toLocaleString()}`,
      totalClients: totalClients.toLocaleString(),
      averageTicket: `€${averageTicket}`,
      growth: '+15%',
      rankings: formattedRankings,
    });
  } catch (err) {
    console.error('[API] Error fetching admin dashboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const bcrypt = require('bcryptjs');

async function ensureMockBusinessesExist() {
  try {
    const hashedPass = await bcrypt.hash('123456', 10);
    
    // Upsert Business account
    await prisma.business.upsert({
      where: { id: 'mock-business-id' },
      update: {
        name: 'Glow (Ejemplo)',
        email: 'contacto@glow.com',
        address: 'Calle de Velázquez, 45, Madrid'
      },
      create: {
        id: 'mock-business-id',
        name: 'Glow (Ejemplo)',
        phone: '34696352940',
        email: 'contacto@glow.com',
        password: hashedPass,
        role: 'BUSINESS',
        address: 'Calle de Velázquez, 45, Madrid',
        welcomeMessage: '¡Hola {{clientName}}! Hemos confirmado tu cita para el {{appointmentDate}} a las {{appointmentTime}} en {{businessName}}.',
        reminderMessage: 'Hola {{clientName}}, recordatorio de tu cita mañana en {{businessName}} a las {{appointmentTime}}.'
      }
    });

    // Upsert Admin account
    await prisma.business.upsert({
      where: { email: 'admin@volta.com' },
      update: {},
      create: {
        id: 'mock-admin-id',
        name: 'Admin Global',
        phone: '34696352940',
        email: 'admin@volta.com',
        password: hashedPass,
        role: 'ADMIN',
        address: 'Local Principal Volta, Madrid'
      }
    });

    console.log('[API] Mock businesses verified/created in database.');

    // Seed example clients and appointments for demonstration if they don't exist yet
    const clientCount = await prisma.client.count({
      where: { businessId: 'mock-business-id' }
    });

    if (clientCount === 0) {
      console.log('[API] Seeding demonstration clients and appointments...');
      
      const c1 = await prisma.client.create({
        data: {
          name: 'Ana',
          surname: 'García (Ejemplo)',
          email: 'ana.garcia@email.com',
          phone: '+34 600 000 001',
          lopdStatus: 'Aceptado',
          frequentService: 'Coloración (Demo)',
          lastVisit: '12 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c2 = await prisma.client.create({
        data: {
          name: 'Marco',
          surname: 'Polo (Ejemplo)',
          email: 'marco.polo@email.com',
          phone: '+34 600 000 002',
          lopdStatus: 'Aceptado',
          frequentService: 'Corte (Demo)',
          lastVisit: '18 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c3 = await prisma.client.create({
        data: {
          name: 'Sofía',
          surname: 'Martín (Ejemplo)',
          email: 'sofia.martin@email.com',
          phone: '+34 600 000 003',
          lopdStatus: 'Pendiente',
          frequentService: 'Manicura (Demo)',
          lastVisit: '22 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c4 = await prisma.client.create({
        data: {
          name: 'Juan',
          surname: 'Herrera (Ejemplo)',
          email: 'juan.herrera@email.com',
          phone: '+34 600 000 004',
          lopdStatus: 'Pendiente',
          frequentService: 'Keratina (Demo)',
          lastVisit: '02 Jun 2024',
          businessId: 'mock-business-id'
        }
      });

      // Calculate dates of the current week for appointments calendar view
      const today = new Date();
      const currentDay = today.getDay(); // 0: Sun, 1: Mon, etc.
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMonday);

      const dateMon = new Date(monday);
      dateMon.setHours(9, 0, 0, 0);

      const dateTue = new Date(monday);
      dateTue.setDate(monday.getDate() + 1);
      dateTue.setHours(10, 0, 0, 0);

      const dateWed = new Date(monday);
      dateWed.setDate(monday.getDate() + 2);
      dateWed.setHours(10, 0, 0, 0);

      const dateThu = new Date(monday);
      dateThu.setDate(monday.getDate() + 3);
      dateThu.setHours(11, 0, 0, 0);

      await prisma.appointment.createMany({
        data: [
          {
            clientName: 'Marco Polo (Ejemplo)',
            clientPhone: '+34 600 000 002',
            appointmentDate: dateMon,
            businessId: 'mock-business-id',
            clientId: c2.id,
            status: 'PENDING'
          },
          {
            clientName: 'Ana García (Ejemplo)',
            clientPhone: '+34 600 000 001',
            appointmentDate: dateTue,
            businessId: 'mock-business-id',
            clientId: c1.id,
            status: 'PENDING'
          },
          {
            clientName: 'Sofía Martín (Ejemplo)',
            clientPhone: '+34 600 000 003',
            appointmentDate: dateWed,
            businessId: 'mock-business-id',
            clientId: c3.id,
            status: 'PENDING'
          },
          {
            clientName: 'Juan Herrera (Ejemplo)',
            clientPhone: '+34 600 000 004',
            appointmentDate: dateThu,
            businessId: 'mock-business-id',
            clientId: c4.id,
            status: 'PENDING'
          }
        ]
      });

      console.log('[API] Demonstration clients and appointments seeded successfully.');
    }
  } catch (err) {
    console.error('[API] Error ensuring mock businesses:', err);
  }
}

// Start server (only if not required as a module)
if (require.main === module) {
  ensureMockBusinessesExist().then(() => {
    app.listen(PORT, () => {
      console.log(`[API] Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
