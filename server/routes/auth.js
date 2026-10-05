const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { recordSecurityEvent } = require('../services/securityAudit');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shiptrack_defensive_secure_jwt_token_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper to generate signed JWT
function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer or driver (Admin registration forbidden via public route)
 * @access  Public
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.sanitizedBody;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
    });

    const token = signToken(user);

    await recordSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      severity: 'INFO',
      req,
      userId: user._id,
      userRole: user.role,
      resource: '/api/auth/register',
      action: 'POST',
      details: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.sanitizedBody;

    // Explicitly select password field for validation
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await recordSecurityEvent({
        eventType: 'AUTH_FAILURE',
        severity: 'WARN',
        req,
        resource: '/api/auth/login',
        action: 'POST',
        details: { attemptedEmail: email, reason: 'User not found' },
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    // Verify password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();

      await recordSecurityEvent({
        eventType: 'AUTH_FAILURE',
        severity: 'WARN',
        req,
        userId: user._id,
        userRole: user.role,
        resource: '/api/auth/login',
        action: 'POST',
        details: {
          attemptedEmail: email,
          failedAttempts: user.failedLoginAttempts,
          reason: 'Incorrect password',
        },
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      await user.save();
    }

    const token = signToken(user);

    await recordSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      severity: 'INFO',
      req,
      userId: user._id,
      userRole: user.role,
      resource: '/api/auth/login',
      action: 'POST',
      details: { email: user.email, role: user.role },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', requireAuth, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (records audit log)
 * @access  Private
 */
router.post('/logout', requireAuth, async (req, res) => {
  await recordSecurityEvent({
    eventType: 'AUTH_SUCCESS',
    severity: 'INFO',
    req,
    userId: req.user._id,
    userRole: req.user.role,
    resource: '/api/auth/logout',
    action: 'POST',
    details: { reason: 'User initiated logout' },
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = router;
