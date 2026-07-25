import express from "express";
import { authenticate, requireRole, validateId, validateBody } from "../middleware/index.js";
import { updateBusinessSchema, updateHoursSchema } from "../validators/index.js";
import * as businessController from "../controllers/businessController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// GET business by ID
router.get("/:id", authenticate, validateId("id"), asyncHandler(businessController.getBusiness));

// PUT update business
router.put(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  validateBody(updateBusinessSchema),
  asyncHandler(businessController.updateBusiness)
);

// GET business hours
router.get("/:id/hours", authenticate, validateId("id"), asyncHandler(businessController.getHours));

// PUT update business hours
router.put(
  "/:id/hours",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  validateBody(updateHoursSchema),
  asyncHandler(businessController.updateHours)
);

export default router;
