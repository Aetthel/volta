const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Startup environment variables verification
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'API_KEY'];
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`\x1b[31m[FATAL] Missing required environment variables: ${missingVars.join(', ')}\x1b[0m`);
  console.error('Please verify your .env configuration file.');
  process.exit(1);
}

const express = require('express');
const prisma = require('./db');
const cron = require('node-cron');
const { runSentinel } = require('./bot');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 3001);

app.set('trust proxy', 1);
app.use(helmet());

// Schedule the Sentinel to run every day at 20:00
cron.schedule('0 20 * * *', () => {
  runSentinel();
});

// CORS Middleware — only allow requests from the configured frontend origin
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rate limiting for public LOPD routes
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Import and mount modular routers
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/lopd', publicLimiter, require('./routes/lopd'));
app.use('/api/business', require('./routes/business'));
app.use('/api/admin', require('./routes/admin'));

const bcrypt = require('bcryptjs');

async function ensureMockBusinessesExist() {
  try {
    const hashedPass = await bcrypt.hash('123456', 10);
    
    // Upsert Business account
    await prisma.business.upsert({
      where: { email: 'contacto@glow.com' },
      update: {
        name: 'Glow (Ejemplo)',
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
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        id: 'mock-admin-id',
        name: 'Admin Global',
        phone: '34696352940',
        email: 'admin@test.com',
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
