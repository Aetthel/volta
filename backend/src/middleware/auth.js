import config from "../config/index.js";
import { verifyToken } from "../utils/crypto.js";
import crypto from "crypto";
import prisma from "../config/db.js";

const API_KEY = config.apiKey;
const JWT_SECRET = config.backendJwtSecret;

function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const authenticate = async (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || !safeCompare(apiKey, API_KEY)) {
    return res.status(401).json({ error: "Acceso no autorizado: API Key inválida o ausente" });
  }

  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso no autorizado: Token no proporcionado" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token, JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ error: "Acceso no autorizado: Token inválido o expirado" });
  }

  req.user = {
    id: decoded.id || null,
    role: decoded.role || null,
    businessId: decoded.businessId || null,
    email: decoded.email || null,
  };

  // Perform database verification of business trial/subscription status (except for subscription endpoints)
  const isSubscriptionRoute =
    req.baseUrl === "/api/subscription" || req.originalUrl?.startsWith("/api/subscription");

  if (decoded.businessId && !isSubscriptionRoute) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: decoded.businessId },
        select: { subscriptionStatus: true, trialExpiresAt: true },
      });

      if (!business && req.user.role !== "ADMIN") {
        return res.status(401).json({
          error: "Negocio no encontrado o sesión expirada. Por favor, inicia sesión de nuevo.",
          code: "SESSION_ORPHANED",
          redirect: "/",
        });
      }

      if (business) {
        const isTrialing = business.subscriptionStatus === "TRIALING";
        const isExpiredStatus =
          business.subscriptionStatus === "EXPIRED" || business.subscriptionStatus === "CANCELLED";
        const isTrialEnded =
          isTrialing && business.trialExpiresAt && new Date(business.trialExpiresAt) < new Date();

        if (isExpiredStatus || isTrialEnded) {
          return res.status(403).json({
            error: "Tu período de prueba o suscripción ha finalizado.",
            code: "TRIAL_EXPIRED",
            redirect: "/",
          });
        }
      }
    } catch (e) {
      console.error("Auth middleware business check error:", e);
    }
  }

  next();
};

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: "Acceso denegado: Permisos insuficientes",
      code: "PERMISSIONS_REVOKED",
      redirect: "/",
    });
  }
  next();
};

const requireApiKey = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || !safeCompare(apiKey, API_KEY)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export { authenticate, requireRole, requireApiKey };
