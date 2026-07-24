import { z } from "zod";
import { logger } from "../utils/logger.js";

const isValidId = (id) => {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

const validateId = (paramName) => (req, res, next) => {
  const value = req.params[paramName] || req.query[paramName] || req.body[paramName];
  if (!value || !isValidId(value)) {
    return res.status(400).json({ error: `Invalid or missing parameter: ${paramName}` });
  }
  next();
};

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    logger.error("[Validation Error]", error);
    const details = error.errors
      ? error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
      : error.message;
    return res.status(400).json({
      error: "Validation failed",
      details,
    });
  }
};

export { isValidId, validateId, validateBody };
