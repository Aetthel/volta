import config from "./config/index.js";
import * as dbInit from "./config/dbInit.js";
import express from "express";
import prisma from "./config/db.js";
import redisClient from "./config/redis.js";
import { createWhatsAppWorker } from "./workers/whatsappWorker.js";
import cron from "node-cron";
import { runSentinel } from "./services/botService.js";
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

// Global Error Handler Middleware
import { errorHandler } from "./middleware/index.js";

const app = express();
const PORT = config.port;

app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
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

// Schedule the Sentinel to run every day at 20:00
cron.schedule("0 20 * * *", async () => {
  try {
    await runSentinel();
  } catch (err) {
    console.error("[Sentinel] Unhandled error in cron:", err);
  }
});

// Clean up expired demos every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const { cleanupExpiredDemos } = await import("./services/demoService.js");
    const result = await cleanupExpiredDemos();
    if (result.deletedCount > 0) {
      console.log(`[Demo Cleanup] Deleted ${result.deletedCount} expired demo(s)`);
    }
  } catch (err) {
    console.error("[Demo Cleanup] Error:", err);
  }
});

// CORS Middleware — only allow requests from configured frontend origins
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-api-key"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Vary", "Origin");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

/**
 * Health check endpoint verifying DB & Redis status
 */
app.get("/health", async (req, res) => {
  let dbStatus = "disconnected";
  let redisStatus = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  if (redisClient) {
    try {
      const pingRes = await redisClient.ping();
      if (pingRes === "PONG") {
        redisStatus = "connected";
      }
    } catch (err) {
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
  max: 100,
  message: { error: "Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limiting for all API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
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
        await whatsappManager.initClient(biz.id).catch((err) => {
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

if (isMain) {
  dbInit
    .ensureMockBusinessesExist()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[API] Server running on port ${PORT}`);
        initActiveWhatsappClients();
        try {
          createWhatsAppWorker();
        } catch (err) {
          console.error("[API] Failed to initialize WhatsApp BullMQ worker:", err);
        }
      });
    })
    .catch((err) => {
      console.error("[API] Failed to initialize database on startup:", err);
      process.exit(1);
    });
}

export default app;
