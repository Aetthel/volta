import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { logger } from "../utils/logger.js";

const isValidId = (id: unknown): boolean => {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

const validateId =
  (paramName: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const value = req.params[paramName] || req.query[paramName] || req.body?.[paramName];
    if (!value || !isValidId(value)) {
      return res.status(400).json({ error: `Parámetro no válido o faltante: ${paramName}` });
    }
    next();
  };

const validateBody =
  (schema: ZodType): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      logger.warn("[Validation Error Body]", { path: req.originalUrl, issues: error.issues });
      const details = error.issues
        ? error.issues.map((e: any) => ({ field: e.path.join("."), message: e.message }))
        : error.message;
      return res.status(400).json({
        error: "Error de validación en los datos enviados.",
        details,
      });
    }
  };

const validateQuery =
  (schema: ZodType): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error: any) {
      logger.warn("[Validation Error Query]", { path: req.originalUrl, issues: error.issues });
      const details = error.issues
        ? error.issues.map((e: any) => ({ field: e.path.join("."), message: e.message }))
        : error.message;
      return res.status(400).json({
        error: "Error de validación en los parámetros de consulta.",
        details,
      });
    }
  };

const validateParams =
  (schema: ZodType): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error: any) {
      logger.warn("[Validation Error Params]", { path: req.originalUrl, issues: error.issues });
      const details = error.issues
        ? error.issues.map((e: any) => ({ field: e.path.join("."), message: e.message }))
        : error.message;
      return res.status(400).json({
        error: "Error de validación en los parámetros de ruta.",
        details,
      });
    }
  };

export { isValidId, validateId, validateBody, validateQuery, validateParams };
