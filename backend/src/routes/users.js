import express from "express";
import rateLimit from "express-rate-limit";
import {
  authenticate,
  requireRole,
  validateId,
  validateBody,
  checkSubscriptionLimits,
} from "../middleware/index.js";
import { createUserSchema, updateUserSchema, registerSchema } from "../validators/index.js";
import * as userController from "../controllers/userController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  message: {
    error:
      "Demasiados intentos de registro desde esta IP. Por favor, inténtalo de nuevo en una hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/users/register (Public registration with rate limiting)
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  asyncHandler(userController.registerUser)
);

// GET /api/users/check-permissions (Heartbeat permission check)
router.get("/check-permissions", authenticate, (req, res) => {
  return res.json({
    status: "ok",
    authorized: true,
    user: req.user,
  });
});

// GET /api/users
router.get("/", authenticate, asyncHandler(userController.getUsers));

// POST /api/users (Invite team member - subject to subscription limits)
router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  checkSubscriptionLimits("INVITE_MEMBER"),
  validateBody(createUserSchema),
  asyncHandler(userController.createUser)
);

// PUT /api/users/:id
router.put(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  validateBody(updateUserSchema),
  asyncHandler(userController.updateUser)
);

// DELETE /api/users/:id
router.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  asyncHandler(userController.deleteUser)
);

export default router;
