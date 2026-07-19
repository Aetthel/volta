import express from 'express';
import { authenticate, validateBody } from '../middleware/index.js';
import { createAlertSchema } from '../validators/index.js';
import * as alertsController from '../controllers/alertsController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

// GET: Fetch all alerts for the logged-in user
router.get('/', authenticate, asyncHandler(alertsController.getAlerts));

// POST: Create a new alert (broadcast or backend triggers)
router.post('/', authenticate, validateBody(createAlertSchema), asyncHandler(alertsController.createAlert));

// PUT: Mark all alerts as read
router.put('/read-all', authenticate, asyncHandler(alertsController.markAllAlertsAsRead));

// PUT: Mark a specific alert as read
router.put('/:id/read', authenticate, asyncHandler(alertsController.markAlertAsRead));

export default router;
