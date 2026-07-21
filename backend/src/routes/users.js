import express from 'express';
import { authenticate, validateId, validateBody } from '../middleware/index.js';
import { createUserSchema, updateUserSchema, registerSchema } from '../validators/index.js';
import * as userController from '../controllers/userController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

// POST /api/users/register (Public registration)
router.post('/register', validateBody(registerSchema), asyncHandler(userController.registerUser));

// GET /api/users
router.get('/', authenticate, validateId('businessId'), asyncHandler(userController.getUsers));

// POST /api/users
router.post('/', authenticate, validateBody(createUserSchema), asyncHandler(userController.createUser));

// PUT /api/users/:id
router.put('/:id', authenticate, validateId('id'), validateBody(updateUserSchema), asyncHandler(userController.updateUser));

// DELETE /api/users/:id
router.delete('/:id', authenticate, validateId('id'), asyncHandler(userController.deleteUser));

export default router;
