import express from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// POST /api/webhooks/lemonsqueezy
router.post(
  "/lemonsqueezy",
  asyncHandler(subscriptionController.handleWebhook)
);

export default router;
