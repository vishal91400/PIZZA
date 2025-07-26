const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await admin.incLoginAttempts();
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    await admin.updateLastLogin();

    // Create JWT token
    const payload = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    // Remove password from response
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Admin logout (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error during logout'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current admin profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error while fetching profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change admin password
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword', 'Current password is required').exists(),
  body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error while changing password'
    });
  }
});

module.exports = router; 