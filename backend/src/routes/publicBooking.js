import express from "express";
import rateLimit from "express-rate-limit";
import * as publicBookingController from "../controllers/publicBookingController.js";
import { validateId, validateBody, requireBookingSession } from "../middleware/index.js";
import {
  publicBookingSchema,
  bookingIdentityStartSchema,
  bookingIdentityVerifySchema,
} from "../validators/index.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

const publicBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 500,
  message: {
    error: "Demasiadas solicitudes de reserva desde esta IP. Inténtalo de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Pedir un código cuesta un WhatsApp al negocio y revela si un teléfono es
// cliente suyo, así que el límite por IP es más estricto que el de reservar.
const identityStartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 8 : 500,
  message: {
    error: "Demasiados intentos de verificación desde esta conexión. Espera unos minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Comprobar un código es barato, pero es el paso que un atacante repetiría para
// adivinar los 6 dígitos. El contador por código vive en el servicio; esto solo
// frena el intento distribuido desde una misma IP.
const identityVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 30 : 500,
  message: {
    error: "Demasiados intentos de verificación desde esta conexión. Espera unos minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Acceso: identificación y verificación del teléfono ---

router.get(
  "/:businessId/profile",
  validateId("businessId"),
  asyncHandler(publicBookingController.getPublicBusinessProfile)
);

router.post(
  "/:businessId/identity/start",
  identityStartLimiter,
  validateId("businessId"),
  validateBody(bookingIdentityStartSchema),
  asyncHandler(publicBookingController.startIdentity)
);

router.post(
  "/:businessId/identity/resend",
  identityStartLimiter,
  validateId("businessId"),
  validateBody(bookingIdentityStartSchema),
  asyncHandler(publicBookingController.resendIdentityCode)
);

router.post(
  "/:businessId/identity/verify",
  identityVerifyLimiter,
  validateId("businessId"),
  validateBody(bookingIdentityVerifySchema),
  asyncHandler(publicBookingController.verifyIdentity)
);

// --- Reserva: todo lo de aquí abajo exige un teléfono ya verificado ---

router.get(
  "/:businessId",
  validateId("businessId"),
  requireBookingSession,
  asyncHandler(publicBookingController.getPublicBusinessData)
);

router.get(
  "/:businessId/available-slots",
  validateId("businessId"),
  requireBookingSession,
  asyncHandler(publicBookingController.getAvailableSlots)
);

router.post(
  "/reserve",
  publicBookingLimiter,
  requireBookingSession,
  validateBody(publicBookingSchema),
  asyncHandler(publicBookingController.createPublicBooking)
);

export default router;
