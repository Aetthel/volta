const config = require('./config');
const dbInit = require('./dbInit');

const express = require('express');
const prisma = require('./db');
const cron = require('node-cron');
const { runSentinel } = require('./bot');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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

// Import and mount modular routers
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/lopd', publicLimiter, require('./routes/lopd'));
app.use('/api/business', require('./routes/business'));
app.use('/api/services', require('./routes/services'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));



// Initialize whatsapp clients for already connected businesses on startup
async function initActiveWhatsappClients() {
  try {
    const whatsappManager = require('./whatsapp');
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

// Start server (only if not required as a module)
if (require.main === module) {
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

module.exports = app;
