import express from 'express';
import * as publicBookingController from '../controllers/publicBookingController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

router.get('/:businessId', asyncHandler(publicBookingController.getPublicBusinessData));
router.post('/reserve', asyncHandler(publicBookingController.createPublicBooking));

export default router;
