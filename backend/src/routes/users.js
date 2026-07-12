import express from 'express';
import { authenticate, validateId, validateBody } from '../middleware/index.js';
import { createUserSchema, updateUserSchema } from '../validators/index.js';
import * as userController from '../controllers/userController.js';
import { asyncHandler } from '../utils/index.js';

const router = express.Router();

// GET /api/users
router.get('/', authenticate, asyncHandler(userController.getUsers));

// POST /api/users
router.post('/', authenticate, validateBody(createUserSchema), asyncHandler(userController.createUser));

// PUT /api/users/:id
router.put('/:id', authenticate, validateId('id'), validateBody(updateUserSchema), asyncHandler(userController.updateUser));

// DELETE /api/users/:id
router.delete('/:id', authenticate, validateId('id'), asyncHandler(userController.deleteUser));

export default router;
