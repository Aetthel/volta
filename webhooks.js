import express from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import * as webhookController from "../controllers/webhookController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// POST /api/webhooks/lemonsqueezy
router.post(
  "/lemonsqueezy",
  asyncHandler(subscriptionController.handleWebhook)
);

// POST /api/webhooks/whatsapp
router.post(
  "/whatsapp",
  asyncHandler(webhookController.handleWhatsAppWebhook)
);

export default router;
