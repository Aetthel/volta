import express from "express";
import {
  authenticate,
  requireRole,
  validateId,
  validateBody,
  checkSubscriptionLimits,
} from "../middleware/index.js";
import { createClassScheduleSchema, updateClassScheduleSchema } from "../validators/index.js";
import * as classSchedulesController from "../controllers/classSchedulesController.js";
import { asyncHandler } from "../utils/index.js";

const router = express.Router();

// GET clases de grupo recurrentes del negocio
router.get(
  "/",
  authenticate,
  validateId("businessId"),
  asyncHandler(classSchedulesController.getClassSchedules)
);

// POST programa una clase semanal ("los martes a las 11:30")
router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  // Una serie crea muchas sesiones de golpe: sin esta comprobación sería la vía
  // fácil para saltarse el tope de reservas del Plan Básico.
  checkSubscriptionLimits("CREATE_APPOINTMENT"),
  validateId("businessId"),
  validateBody(createClassScheduleSchema),
  asyncHandler(classSchedulesController.createClassSchedule)
);

// PUT cambia días, hora, fin o alumnos y rehace las sesiones futuras
router.put(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  validateBody(updateClassScheduleSchema),
  asyncHandler(classSchedulesController.updateClassSchedule)
);

// DELETE cancela la serie completa (conserva las sesiones ya celebradas)
router.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "JEFE"]),
  validateId("id"),
  asyncHandler(classSchedulesController.deleteClassSchedule)
);

export default router;
