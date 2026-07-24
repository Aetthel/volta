import express from "express";
import { authenticate, validateId, validateBody } from "../middleware/index.js";
import { templateSchema } from "../validators/index.js";
import * as whatsappController from "../controllers/whatsappController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

router.post(
  "/init",
  authenticate,
  validateId("businessId"),
  asyncHandler(whatsappController.initClient)
);

router.get(
  "/status",
  authenticate,
  validateId("businessId"),
  asyncHandler(whatsappController.getStatus)
);

router.post(
  "/disconnect",
  authenticate,
  validateId("businessId"),
  asyncHandler(whatsappController.disconnectClient)
);

router.get(
  "/templates",
  authenticate,
  validateId("businessId"),
  asyncHandler(whatsappController.getTemplates)
);

router.post(
  "/templates",
  authenticate,
  validateId("businessId"),
  validateBody(templateSchema),
  asyncHandler(whatsappController.updateTemplates)
);

export default router;
