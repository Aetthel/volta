import express from "express";
import { authenticate, validateId, validateBody } from "../middleware/index.js";
import { createClientSchema, updateClientSchema } from "../validators/index.js";
import * as clientsController from "../controllers/clientsController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

router.get("/", authenticate, validateId("businessId"), asyncHandler(clientsController.getClients));

router.post(
  "/",
  authenticate,
  validateId("businessId"),
  validateBody(createClientSchema),
  asyncHandler(clientsController.createClient)
);

router.put(
  "/:id",
  authenticate,
  validateId("id"),
  validateBody(updateClientSchema),
  asyncHandler(clientsController.updateClient)
);

router.delete("/:id", authenticate, validateId("id"), asyncHandler(clientsController.deleteClient));

router.post(
  "/:id/resend-consent",
  authenticate,
  validateId("id"),
  asyncHandler(clientsController.resendConsent)
);

router.post(
  "/:id/send-message",
  authenticate,
  validateId("id"),
  asyncHandler(clientsController.sendMessage)
);

export default router;
