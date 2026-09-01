import express from "express";
import { authenticate, requireRole, validateId, validateBody } from "../middleware/index.js";
import {
  updateBusinessSchema,
  updateHoursSchema,
  updateHolidaysSchema,
} from "../validators/index.js";
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

// GET festivos observados por el negocio
router.get(
  "/:id/holidays",
  authenticate,
  validateId("id"),
  asyncHandler(businessController.getHolidays)
);

// PUT actualizar qué festivos observa el negocio
router.put(
  "/:id/holidays",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  validateBody(updateHolidaysSchema),
  asyncHandler(businessController.updateHolidays)
);

export default router;
