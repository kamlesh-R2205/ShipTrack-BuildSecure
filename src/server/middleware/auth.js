const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const { ROLES } = require('../config/constants');
const { recordSecurityEvent } = require('../services/securityAudit');

const JWT_SECRET = process.env.JWT_SECRET || 'shiptrack_defensive_secure_jwt_token_secret_key_2026';

/**
 * Middleware: Verify JWT and attach authenticated user to request.
 */
async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      await recordSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'WARN',
        req,
        userRole: 'ANONYMOUS',
        resource: req.originalUrl,
        action: req.method,
        details: { reason: 'No token provided' },
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login.',
      });
    }

    // Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      await recordSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'WARN',
        req,
        userRole: 'ANONYMOUS',
        resource: req.originalUrl,
        action: req.method,
        details: { reason: 'Invalid or expired token', error: jwtErr.message },
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.',
      });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: Enforce Role-Based Access Control (RBAC).
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      await recordSecurityEvent({
        eventType: 'FORBIDDEN_ROLE_ACTION',
        severity: 'HIGH',
        req,
        userId: req.user._id,
        userRole: req.user.role,
        resource: req.originalUrl,
        action: req.method,
        details: {
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          reason: 'User role does not satisfy endpoint RBAC constraint',
        },
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not possess the required role permissions.',
      });
    }

    next();
  };
}

/**
 * Middleware: Enforce Object-Level Authorization (BOLA/IDOR Defense).
 * Ensures:
 * - Admin has full operational visibility
 * - Customer can ONLY view/manipulate their own shipments
 * - Driver can ONLY view/manipulate shipments assigned to them
 */
function authorizeShipmentAccess(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const shipmentId = req.params[paramName];

      if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid shipment identifier format.',
        });
      }

      const shipment = await Shipment.findById(shipmentId)
        .populate('sender', 'name email phone')
        .populate('assignedDriver', 'name email phone');

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: 'Shipment not found.',
        });
      }

      const userRole = req.user.role;
      const userId = req.user._id.toString();

      // 1. ADMIN has global operational access
      if (userRole === ROLES.ADMIN) {
        req.shipment = shipment;
        return next();
      }

      // 2. CUSTOMER can only access shipments they created (ownership check)
      if (userRole === ROLES.CUSTOMER) {
        const senderId = shipment.sender._id ? shipment.sender._id.toString() : shipment.sender.toString();
        if (senderId !== userId) {
          await recordSecurityEvent({
            eventType: 'FORBIDDEN_RESOURCE_ACCESS',
            severity: 'HIGH',
            req,
            userId: req.user._id,
            userRole: req.user.role,
            resource: req.originalUrl,
            action: req.method,
            details: {
              attemptedShipmentId: shipmentId,
              actualOwnerId: senderId,
              requestingUserId: userId,
              violation: 'Customer BOLA/IDOR attempt on foreign shipment',
            },
          });

          return res.status(403).json({
            success: false,
            error: 'Access Denied: You do not have permission to access this shipment.',
          });
        }
      }

      // 3. DRIVER can only access shipments assigned specifically to them
      if (userRole === ROLES.DRIVER) {
        const assignedDriverId = shipment.assignedDriver
          ? shipment.assignedDriver._id
            ? shipment.assignedDriver._id.toString()
            : shipment.assignedDriver.toString()
          : null;

        if (!assignedDriverId || assignedDriverId !== userId) {
          await recordSecurityEvent({
            eventType: 'FORBIDDEN_RESOURCE_ACCESS',
            severity: 'HIGH',
            req,
            userId: req.user._id,
            userRole: req.user.role,
            resource: req.originalUrl,
            action: req.method,
            details: {
              attemptedShipmentId: shipmentId,
              assignedDriverId,
              requestingDriverId: userId,
              violation: 'Driver attempted to access shipment not assigned to them',
            },
          });

          return res.status(403).json({
            success: false,
            error: 'Access Denied: This shipment is not assigned to your delivery queue.',
          });
        }
      }

      req.shipment = shipment;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireAuth,
  requireRole,
  authorizeShipmentAccess,
};
