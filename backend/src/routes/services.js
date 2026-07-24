import express from "express";
import { authenticate, validateId, validateBody } from "../middleware/index.js";
import { createServiceSchema, updateServiceSchema } from "../validators/index.js";
import * as servicesController from "../controllers/servicesController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// GET active services for a business
router.get(
  "/",
  authenticate,
  validateId("businessId"),
  asyncHandler(servicesController.getServices)
);

// POST create a new service
router.post(
  "/",
  authenticate,
  validateId("businessId"),
  validateBody(createServiceSchema),
  asyncHandler(servicesController.createService)
);

// PUT update a service
router.put(
  "/:id",
  authenticate,
  validateId("id"),
  validateBody(updateServiceSchema),
  asyncHandler(servicesController.updateService)
);

// DELETE deactivate service (soft delete)
router.delete(
  "/:id",
  authenticate,
  validateId("id"),
  asyncHandler(servicesController.deleteService)
);

export default router;
