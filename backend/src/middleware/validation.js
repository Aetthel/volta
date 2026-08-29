import { z } from "zod";
import { logger } from "../utils/logger.js";

const isValidId = (id) => {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

const validateId = (paramName) => (req, res, next) => {
  const value = req.params[paramName] || req.query[paramName] || req.body[paramName];
  if (!value || !isValidId(value)) {
    return res.status(400).json({ error: `Parámetro no válido o faltante: ${paramName}` });
  }
  next();
};

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    logger.warn("[Validation Error Body]", { path: req.originalUrl, issues: error.issues });
    const details = error.issues
      ? error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      : error.message;
    return res.status(400).json({
      error: "Error de validación en los datos enviados.",
      details,
    });
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    logger.warn("[Validation Error Query]", { path: req.originalUrl, issues: error.issues });
    const details = error.issues
      ? error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      : error.message;
    return res.status(400).json({
      error: "Error de validación en los parámetros de consulta.",
      details,
    });
  }
};

const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (error) {
    logger.warn("[Validation Error Params]", { path: req.originalUrl, issues: error.issues });
    const details = error.issues
      ? error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      : error.message;
    return res.status(400).json({
      error: "Error de validación en los parámetros de ruta.",
      details,
    });
  }
};

export { isValidId, validateId, validateBody, validateQuery, validateParams };
