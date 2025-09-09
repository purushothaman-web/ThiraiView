const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Middleware that requires authentication
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Middleware that requires superuser (ADMIN) role
function requireSuperuser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Superuser access required' });
  }
  
  next();
}

// Middleware that requires admin or moderator role
function requireAdminOrModerator(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!['ADMIN', 'MODERATOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin or moderator access required' });
  }
  
  next();
}

// Middleware that allows optional authentication
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token, no user, but allow access
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    console.warn('Optional JWT verification failed:', error.message);
    // proceed without user info
  }

  next();
}

// Export all middleware functions
requireAuth.optional = optionalAuth;
requireAuth.superuser = requireSuperuser;
requireAuth.adminOrModerator = requireAdminOrModerator;

module.exports = requireAuth;
