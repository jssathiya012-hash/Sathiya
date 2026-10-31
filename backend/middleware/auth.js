import jwt from 'jsonwebtoken';
import { DB } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop-smartsub-jwt-secret-key-2026';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in first.' });
    }
    const userRole = (req.user.role || '').toUpperCase();
    const upperRoles = allowedRoles.map(r => r.toUpperCase());

    if (!upperRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
}

export function logActivity(action, description) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          await DB.ActivityLog().create({
            userId: req.user.id || req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action,
            description: typeof description === 'function' ? description(req) : description,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error('Failed to log activity:', e.message);
        }
      }
    });
    next();
  };
}
