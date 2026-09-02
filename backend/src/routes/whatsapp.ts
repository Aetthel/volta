import express from "express";
import { authenticate, requireRole, validateId, validateBody, checkSubscriptionLimits } from "../middleware/index.js";
import { templateSchema } from "../validators/index.js";
import * as whatsappController from "../controllers/whatsappController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

router.post(
  "/init",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("businessId"),
  checkSubscriptionLimits("WHATSAPP_CONNECT"),
  asyncHandler(whatsappController.initClient)
);

router.get(
  "/status",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("businessId"),
  asyncHandler(whatsappController.getStatus)
);

router.post(
  "/disconnect",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("businessId"),
  asyncHandler(whatsappController.disconnectClient)
);

router.get(
  "/templates",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("businessId"),
  asyncHandler(whatsappController.getTemplates)
);

router.post(
  "/templates",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("businessId"),
  validateBody(templateSchema),
  asyncHandler(whatsappController.updateTemplates)
);

export default router;
