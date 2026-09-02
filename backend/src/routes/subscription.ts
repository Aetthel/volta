import express from "express";
import { authenticate, requireRole } from "../middleware/index.js";
import * as subscriptionController from "../controllers/subscriptionController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// GET current subscription and billing status
router.get(
  "/current",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  asyncHandler(subscriptionController.getCurrentSubscription)
);

// POST create checkout URL (Lemon Squeezy session or mock)
router.post(
  "/checkout-url",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  asyncHandler(subscriptionController.createCheckoutUrl)
);

// POST cancel subscription at period end
router.post(
  "/cancel",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  asyncHandler(subscriptionController.cancelSubscription)
);

// POST mock activate (for testing / development)
router.post(
  "/mock-activate",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  asyncHandler(subscriptionController.mockActivate)
);

// GET invoices history
router.get(
  "/invoices",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  asyncHandler(subscriptionController.getInvoices)
);

export default router;
