/* =========================================
   SONIVIVA — Auth Middleware
   ========================================= */
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'soniviva-fallback-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch (e) { req.user = null; }
  } else {
    req.user = null;
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, optionalAuth };
