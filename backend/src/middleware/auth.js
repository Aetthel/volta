import config from '../config/index.js';
import { verifyToken } from '../utils/crypto.js';
import crypto from 'crypto';

const API_KEY = config.apiKey;
const JWT_SECRET = config.backendJwtSecret;

function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || !safeCompare(apiKey, API_KEY)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token, JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = {
    id: decoded.id || null,
    role: decoded.role || null,
    businessId: decoded.businessId || null,
    email: decoded.email || null,
  };
  next();
};

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  next();
};

const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || !safeCompare(apiKey, API_KEY)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export {
  authenticate,
  requireRole,
  requireApiKey,
};
