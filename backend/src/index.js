import config from './config/index.js';
import * as dbInit from './config/dbInit.js';
import express from 'express';
import prisma from './config/db.js';
import cron from 'node-cron';
import { runSentinel } from './services/botService.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

// Import modular routers
import appointmentsRouter from './routes/appointments.js';
import clientsRouter from './routes/clients.js';
import whatsappRouter from './routes/whatsapp.js';
import lopdRouter from './routes/lopd.js';
import businessRouter from './routes/business.js';
import servicesRouter from './routes/services.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';

// Global Error Handler Middleware
import { errorHandler } from './middleware/index.js';

const app = express();
const PORT = config.port;

app.set('trust proxy', 1);
app.use(helmet());

// Schedule the Sentinel to run every day at 20:00
cron.schedule('0 20 * * *', () => {
  runSentinel();
});

// CORS Middleware — only allow requests from the configured frontend origin
const ALLOWED_ORIGIN = config.frontendUrl;

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Mount modular routers
app.use('/api/appointments', appointmentsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/lopd', publicLimiter, lopdRouter);
app.use('/api/business', businessRouter);
app.use('/api/services', servicesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

// Initialize whatsapp clients for already connected businesses on startup
async function initActiveWhatsappClients() {
  try {
    const { default: whatsappManager } = await import('./services/whatsappService.js');
    const connectedBusinesses = await prisma.business.findMany({
      where: { whatsappStatus: 'CONNECTED' },
      select: { id: true }
    });
    if (connectedBusinesses.length > 0) {
      console.log(`[WhatsApp] Auto-initializing ${connectedBusinesses.length} connected clients on startup...`);
      for (const biz of connectedBusinesses) {
        await whatsappManager.initClient(biz.id).catch(err => {
          console.error(`[WhatsApp] Auto-init failed for ${biz.id}:`, err);
        });
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Error auto-initializing clients on startup:', err);
  }
}

// Start server (only if executed directly)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  dbInit.ensureMockBusinessesExist().then(() => {
    app.listen(PORT, () => {
      console.log(`[API] Server running on port ${PORT}`);
      initActiveWhatsappClients();
    });
  }).catch(err => {
    console.error('[API] Failed to initialize database on startup:', err);
    process.exit(1);
  });
}

export default app;
