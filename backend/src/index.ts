import config from "./config/index.js";
import * as dbInit from "./config/dbInit.js";
import express, { type Request, type Response, type NextFunction } from "express";
import type { Server } from "http";
import prisma from "./config/db.js";
import redisClient from "./config/redis.js";
import { createWhatsAppWorker } from "./workers/whatsappWorker.js";
import cron from "node-cron";
import { runSentinel } from "./services/botService.js";
import { cleanupExpiredDemos } from "./services/demoService.js";
import { purgeExpiredConsentIdentifiers } from "./services/lopdService.js";
import { purgeExpiredVerifications } from "./services/bookingIdentityService.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

// Import modular routers
import appointmentsRouter from "./routes/appointments.js";
import clientsRouter from "./routes/clients.js";
import whatsappRouter from "./routes/whatsapp.js";
import lopdRouter from "./routes/lopd.js";
import businessRouter from "./routes/business.js";
import servicesRouter from "./routes/services.js";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import demoRouter from "./routes/demo.js";
import alertsRouter from "./routes/alerts.js";
import publicBookingRouter from "./routes/publicBooking.js";
import subscriptionRouter from "./routes/subscription.js";
import webhooksRouter from "./routes/webhooks.js";
import authSecurityRouter from "./routes/authSecurity.js";

// Global Error Handler Middleware
import { errorHandler } from "./middleware/index.js";

const app = express();
const PORT = config.port;

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// Schedule the Sentinel to scan for upcoming 24h appointments every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  try {
    await runSentinel();
  } catch (err) {
    console.error("[Sentinel] Unhandled error in cron:", err);
  }
});

// Clean up expired demos every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const result = await cleanupExpiredDemos();
    if (result && result.deletedCount > 0) {
      console.log(`[Demo Cleanup] Deleted ${result.deletedCount} expired demo(s)`);
    }
  } catch (err) {
    console.error("[Demo Cleanup] Error:", err);
  }
});

// Purge expired LOPD consent identifiers every day at 03:30, off-peak and away
// from the Sentinel window so a long scan never overlaps with the evening send.
cron.schedule("30 3 * * *", async () => {
  try {
    await purgeExpiredConsentIdentifiers();
  } catch (err) {
    console.error("[LOPD Purge] Error:", err);
  }
});

// Purge public-booking verification data every day at 03:45, right after the
// LOPD purge: the phone, name and IP of someone who never finished a booking
// stop being necessary once the code has expired.
cron.schedule("45 3 * * *", async () => {
  try {
    await purgeExpiredVerifications();
  } catch (err) {
    console.error("[Booking Verification Purge] Error:", err);
  }
});

// CORS Middleware — only allow requests from configured frontend origins
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-api-key, x-booking-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(
  express.json({
    limit: "50mb",
    verify: (req: Request, _res: Response, buf: Buffer) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * Health check endpoint verifying DB & Redis status
 */
app.get("/health", async (_req: Request, res: Response) => {
  let dbStatus = "disconnected";
  let redisStatus = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  if (redisClient) {
    try {
      const pingRes = await redisClient.ping();
      if (pingRes === "PONG") {
        redisStatus = "connected";
      }
    } catch (err: any) {
      redisStatus = `error: ${err.message}`;
    }
  } else {
    redisStatus = "disabled";
  }

  const isHealthy =
    dbStatus === "connected" && (redisStatus === "connected" || redisStatus === "disabled");
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? "ok" : "degraded",
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

// Rate limiting for public LOPD routes
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 2000,
  message: { error: "Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limiting for all API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 1000 : 10000,
  message: { error: "Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount modular routers
app.use("/api/demo", demoRouter);
app.use("/api/appointments", globalLimiter, appointmentsRouter);
app.use("/api/clients", globalLimiter, clientsRouter);
app.use("/api/whatsapp", globalLimiter, whatsappRouter);
app.use("/api/lopd", publicLimiter, lopdRouter);
app.use("/api/business", globalLimiter, businessRouter);
app.use("/api/services", globalLimiter, servicesRouter);
app.use("/api/admin", globalLimiter, adminRouter);
app.use("/api/users", globalLimiter, usersRouter);
app.use("/api/alerts", globalLimiter, alertsRouter);
app.use("/api/public/booking", publicLimiter, publicBookingRouter);
app.use("/api/subscription", globalLimiter, subscriptionRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/auth-security", globalLimiter, authSecurityRouter);

app.use(errorHandler);

// Initialize whatsapp clients for already connected businesses on startup
async function initActiveWhatsappClients() {
  try {
    const { default: whatsappManager } = await import("./services/whatsappService.js");
    const connectedBusinesses = await prisma.business.findMany({
      where: { whatsappStatus: "CONNECTED" },
      select: { id: true },
    });
    if (connectedBusinesses.length > 0) {
      console.log(
        `[WhatsApp] Auto-initializing ${connectedBusinesses.length} connected clients on startup...`
      );
      for (const biz of connectedBusinesses) {
        await whatsappManager.initClient(biz.id).catch((err: any) => {
          console.error(`[WhatsApp] Auto-init failed for ${biz.id}:`, err);
        });
      }
    }
  } catch (err) {
    console.error("[WhatsApp] Error auto-initializing clients on startup:", err);
  }
}

// Start server (only if executed directly)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

function setupGracefulShutdown(serverInstance?: Server | null) {
  const shutdown = async (signal: string) => {
    console.log(`[API] Recibida señal ${signal}. Iniciando Graceful Shutdown...`);
    if (serverInstance) {
      serverInstance.close(() => {
        console.log("[API] Servidor HTTP cerrado.");
      });
    }
    try {
      if (redisClient) {
        await redisClient.quit();
        console.log("[API] Conexión a Redis cerrada.");
      }
      await prisma.$disconnect();
      console.log("[API] Conexión a Prisma/Postgres cerrada.");
    } catch (err) {
      console.error("[API] Error al cerrar conexiones:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (isMain) {
  dbInit
    .ensureMockBusinessesExist()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`[API] Server running on port ${PORT}`);
        initActiveWhatsappClients();
        try {
          createWhatsAppWorker();
        } catch (err) {
          console.error("[API] Failed to initialize WhatsApp BullMQ worker:", err);
        }
      });

      setupGracefulShutdown(server);
    })
    .catch((err: any) => {
      console.error("[API] Failed to initialize database on startup:", err);
      process.exit(1);
    });
}

export default app;
