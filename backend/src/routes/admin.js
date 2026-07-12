import express from 'express';
import { authenticate, requireRole, validateId, validateBody } from '../middleware/index.js';
import { createBusinessSchema } from '../validators/index.js';
import * as adminController from '../controllers/adminController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

// GET businesses
router.get('/businesses', asyncHandler(adminController.getBusinesses));

// POST create a new business
router.post('/businesses', validateBody(createBusinessSchema), asyncHandler(adminController.createBusiness));

// DELETE a business
router.delete('/businesses/:id', validateId('id'), asyncHandler(adminController.deleteBusiness));

// GET dashboard metrics
router.get('/dashboard', asyncHandler(adminController.getDashboard));

export default router;
