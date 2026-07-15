import express from 'express';
import { validateId } from '../middleware/index.js';
import * as lopdController from '../controllers/lopdController.js';
import { asyncHandler } from '../utils/index.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limit for consent acceptance to prevent brute-force token guessing
const consentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET consentimiento LOPD del cliente (token via headers)
router.get('/:id', validateId('id'), asyncHandler(lopdController.getConsent));

// POST aceptar consentimiento LOPD (token via headers + rate limited)
router.post('/:id/accept', consentLimiter, validateId('id'), asyncHandler(lopdController.acceptConsent));

export default router;
