import express from 'express';
import { validateId } from '../middleware/index.js';
import * as lopdController from '../controllers/lopdController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

// GET consentimiento LOPD del cliente
router.get('/:id', validateId('id'), asyncHandler(lopdController.getConsent));

// POST aceptar consentimiento LOPD
router.post('/:id/accept', validateId('id'), asyncHandler(lopdController.acceptConsent));

export default router;
