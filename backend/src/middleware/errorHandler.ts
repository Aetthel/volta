/**
 * Global Express error handling middleware.
 * Formats API errors and handles custom, Zod, and DB-level (Prisma) exceptions.
 */
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/appError.js";

export interface CustomError extends Error {
  statusCode?: number;
  status?: number | string;
  isOperational?: boolean;
  details?: unknown;
  code?: string;
  issues?: Array<{ path: (string | number)[]; message: string }>;
  meta?: { target?: string[] };
  body?: unknown;
}

export const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response | void => {
  logger.error("[Global Error Handler]", {
    message: err.message,
    name: err.name,
    code: err.code,
    statusCode: err.statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  // AppError (Operational errors thrown intentionally)
  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Zod Validation Errors
  if (err.name === "ZodError" || err.issues) {
    const details = (err.issues || []).map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      error: "Error de validación en los datos enviados.",
      details,
    });
  }

  // Prisma Specific Errors
  if (
    err.name === "PrismaClientKnownRequestError" ||
    (err.code && typeof err.code === "string" && err.code.startsWith("P"))
  ) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          error: "Ya existe un registro con esos datos (restricción de unicidad violada).",
          fields: err.meta?.target || [],
        });
      case "P2025":
        return res.status(404).json({
          error: "El recurso solicitado no fue encontrado en la base de datos.",
        });
      case "P2003":
        return res.status(400).json({
          error: "Violación de clave foránea en la base de datos.",
        });
      default:
        return res.status(400).json({
          error: "Error en la operación de base de datos.",
          code: err.code,
        });
    }
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Formato JSON no válido en el cuerpo de la petición." });
  }

  // Fallback for unhandled exceptions
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  return res.status(statusCode).json({
    error:
      statusCode === 500 ? "Error interno del servidor." : err.message || "Error en la petición.",
  });
};

export default errorHandler;
