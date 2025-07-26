const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is active
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive admin account'
        });
      }
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive customer account'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid token role'
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to require customer role
const requireCustomer = (req, res, next) => {
  if (req.userRole !== 'customer') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Customer privileges required.'
    });
  }
  next();
};

// Middleware to require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient privileges.'
      });
    }
    next();
  };
};

// Middleware to require specific permissions (for admin)
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      req.userRole = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('-password');
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    // Don't fail on token errors, just set user to null
    req.user = null;
    req.userRole = null;
    next();
  }
};

module.exports = {
  auth,
  requireAdmin,
  requireCustomer,
  requireRole,
  requirePermission,
  optionalAuth
}; 