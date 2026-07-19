import express from 'express';
import { requireApiKey } from '../middleware/index.js';
import * as demoController from '../controllers/demoController.js';
import { asyncHandler } from '../utils/index.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 1000,
  message: { error: 'Has creado demasiadas demos. Inténtalo de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', requireApiKey, demoLimiter, asyncHandler(demoController.createDemo));
router.delete('/', requireApiKey, demoLimiter, asyncHandler(demoController.deleteDemo));

export default router;
