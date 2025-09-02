const jwt = require('jsonwebtoken');

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

// Export required middleware as default, and optional via property
requireAuth.optional = optionalAuth;

module.exports = requireAuth;
