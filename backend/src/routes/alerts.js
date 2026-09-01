import express from "express";
import { authenticate, requireRole, validateBody } from "../middleware/index.js";
import { createAlertSchema } from "../validators/index.js";
import * as alertsController from "../controllers/alertsController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// GET: Summary counts of alerts
router.get("/summary", authenticate, asyncHandler(alertsController.getAlertSummary));

// GET: Fetch all alerts for the logged-in user
router.get("/", authenticate, asyncHandler(alertsController.getAlerts));

// POST: Create a new alert (broadcast or backend triggers)
router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateBody(createAlertSchema),
  asyncHandler(alertsController.createAlert)
);

// PUT: Mark all alerts as read
router.put("/read-all", authenticate, asyncHandler(alertsController.markAllAlertsAsRead));

// PUT: Mark a specific alert as read
router.put("/:id/read", authenticate, asyncHandler(alertsController.markAlertAsRead));

// PUT: Archive an alert
router.put("/:id/archive", authenticate, asyncHandler(alertsController.archiveAlert));

// PUT: Unarchive an alert
router.put("/:id/unarchive", authenticate, asyncHandler(alertsController.unarchiveAlert));

// DELETE: Delete an alert
router.delete("/:id", authenticate, asyncHandler(alertsController.deleteAlert));

export default router;
