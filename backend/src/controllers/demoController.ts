import * as demoService from "../services/demoService.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

export const createSandboxDemo = async (_req: Request, res: Response) => {
  const demoData = await demoService.createDemo();
  return res.status(201).json({
    success: true,
    message: "Entorno de prueba creado exitosamente.",
    credentials: {
      email: demoData.email,
      password: demoData.password,
    },
    businessId: demoData.businessId,
    expiresAt: demoData.expiresAt,
  });
};

export const createDemo = createSandboxDemo;

export const deleteDemo = async (req: AuthRequest, res: Response) => {
  const businessId =
    req.user?.businessId || (req.body?.businessId as string) || (req.query?.businessId as string);
  if (!businessId) {
    return res.status(400).json({ error: "Se requiere businessId para eliminar la demo." });
  }

  const deleted = await demoService.deleteDemo(businessId);
  if (!deleted) {
    return res.status(404).json({ error: "El entorno de prueba no existe o ya ha expirado." });
  }

  return res
    .status(200)
    .json({ success: true, message: "Entorno de prueba finalizado y eliminado correctamente." });
};

export default {
  createSandboxDemo,
  createDemo,
  deleteDemo,
};
