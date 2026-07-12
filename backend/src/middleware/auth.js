import config from '../config/index.js';
import { verifyToken } from '../utils/crypto.js';

const API_KEY = config.apiKey;
const JWT_SECRET = config.backendJwtSecret;

const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const authHeader = req.header('Authorization');
  let userContext = { role: null, businessId: null, email: null };

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token, JWT_SECRET);
    if (decoded) {
      userContext = {
        role: decoded.role || null,
        businessId: decoded.businessId || null,
        email: decoded.email || null,
      };
    } else {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  }

  req.user = userContext;
  next();
};

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  next();
};

export {
  authenticate,
  requireRole,
};
