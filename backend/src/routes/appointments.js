import express from 'express';
import { authenticate, validateId, validateBody } from '../middleware/index.js';
import { appointmentSchema, updateAppointmentSchema } from '../validators/index.js';
import * as appointmentsController from '../controllers/appointmentsController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

router.get('/', authenticate, validateId('businessId'), asyncHandler(appointmentsController.getAppointments));

router.post('/', authenticate, validateId('businessId'), validateBody(appointmentSchema), asyncHandler(appointmentsController.createAppointment));

router.put('/:id', authenticate, validateId('id'), validateBody(updateAppointmentSchema), asyncHandler(appointmentsController.updateAppointment));

router.delete('/:id', authenticate, validateId('id'), asyncHandler(appointmentsController.deleteAppointment));

export default router;
