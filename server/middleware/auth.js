const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, ROLES } = require('../config/rbac');

const JWT_SECRET = process.env.JWT_SECRET || 'skillsync_rbac_dev_secret_key_2026_secure';

/**
 * Strict Authentication Middleware
 * Validates the JWT token and fetches the current user from MongoDB.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session token.',
      });
    }

    // Lookup user in database (supports both subject claim 'sub' and legacy claim 'id')
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account associated with this session no longer exists.',
      });
    }

    // Attach trusted user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
};

/**
 * Optional Authentication Middleware
 * If a valid token exists, populates req.user; otherwise leaves req.user null.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.sub || decoded.id;
        const user = await User.findById(userId);
        if (user) {
          req.user = user;
        }
      } catch (e) {
        // Token invalid, proceed as anonymous
      }
    }
    next();
  } catch (err) {
    next();
  }
};

/**
 * RBAC Permission Authorization Middleware
 * Enforces server-side permission checks against the user's persisted role.
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to perform this action.',
      });
    }

    const userRole = req.user.role || ROLES.STAFF;
    const allowed = hasPermission(userRole, permission);

    if (!allowed) {
      return res.status(403).json({
        error: 'Access Denied (403 Forbidden)',
        message: `Role '${userRole}' does not possess the required permission '${permission}'.`,
        requiredPermission: permission,
        userRole: userRole,
      });
    }

    next();
  };
};

/**
 * RBAC Role Authorization Middleware
 * Allows access only to specified roles.
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Denied (403 Forbidden)',
        message: `Action restricted to roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
        allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Helper to generate signed JWT for a user
 */
const generateToken = (user) => {
  const userId = user._id ? user._id.toString() : (user.id || '');
  return jwt.sign(
    {
      id: userId,
      sub: userId, // RFC 7519 standard token subject claim
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'skillsync-api',
      audience: 'skillsync-client',
    }
  );
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requirePermission,
  requireRole,
  generateToken,
};
