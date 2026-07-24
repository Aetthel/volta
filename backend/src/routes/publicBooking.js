import express from 'express';
import rateLimit from 'express-rate-limit';
import * as publicBookingController from '../controllers/publicBookingController.js';
import { validateId, validateBody } from '../middleware/index.js';
import { publicBookingSchema } from '../validators/index.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

const publicBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 500,
  message: { error: 'Demasiadas solicitudes de reserva desde esta IP. Inténtalo de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/:businessId', validateId('businessId'), asyncHandler(publicBookingController.getPublicBusinessData));
router.post('/reserve', publicBookingLimiter, validateBody(publicBookingSchema), asyncHandler(publicBookingController.createPublicBooking));

export default router;
