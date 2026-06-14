const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const API_KEY = process.env.API_KEY;

const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const isValidId = (id) => {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

const validateId = (paramName) => (req, res, next) => {
  const value = req.params[paramName] || req.query[paramName] || req.body[paramName];
  if (!value || !isValidId(value)) {
    return res.status(400).json({ error: `Invalid or missing parameter: ${paramName}` });
  }
  next();
};

const { z } = require('zod');

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.error('[Validation Error]', error);
    const details = error.errors
      ? error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      : error.message;
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }
};

module.exports = {
  authenticate,
  isValidId,
  validateId,
  validateBody,
};
