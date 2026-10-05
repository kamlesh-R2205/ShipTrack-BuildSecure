const express = require('express');
const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { ROLES, SHIPMENT_STATUS } = require('../config/constants');
const { requireAuth, requireRole } = require('../middleware/auth');
const { recordSecurityEvent } = require('../services/securityAudit');

const router = express.Router();

// Strict RBAC: All admin routes require ADMIN role
router.use(requireAuth, requireRole(ROLES.ADMIN));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Comprehensive system logistics & operational telemetry
 * @access  Private (ADMIN)
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalShipments,
      activeShipments,
      deliveredShipments,
      unassignedShipments,
      totalDrivers,
      totalCustomers,
      recentShipments,
      recentSecurityEvents,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({
        status: {
          $in: [
            SHIPMENT_STATUS.CREATED,
            SHIPMENT_STATUS.ASSIGNED,
            SHIPMENT_STATUS.PICKED_UP,
            SHIPMENT_STATUS.IN_TRANSIT,
            SHIPMENT_STATUS.OUT_FOR_DELIVERY,
          ],
        },
      }),
      Shipment.countDocuments({ status: SHIPMENT_STATUS.DELIVERED }),
      Shipment.countDocuments({
        status: SHIPMENT_STATUS.CREATED,
        assignedDriver: null,
      }),
      User.countDocuments({ role: ROLES.DRIVER }),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      Shipment.find()
        .populate('sender', 'name email phone')
        .populate('assignedDriver', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(10),
      SecurityLog.find()
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalShipments,
        activeShipments,
        deliveredShipments,
        pendingAssignments: unassignedShipments,
        activeDrivers: totalDrivers,
        totalCustomers,
      },
      recentShipments,
      recentSecurityEvents,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/admin/assign
 * @desc    Assign or reassign a driver to a shipment
 * @access  Private (ADMIN)
 */
router.post('/assign', async (req, res, next) => {
  try {
    const { shipmentId, driverId, note } = req.body;

    if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid shipmentId is required.',
      });
    }

    if (!driverId || !mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid driverId is required.',
      });
    }

    const [shipment, driver] = await Promise.all([
      Shipment.findById(shipmentId),
      User.findById(driverId),
    ]);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found.',
      });
    }

    if (!driver || driver.role !== ROLES.DRIVER) {
      return res.status(400).json({
        success: false,
        error: 'Target user does not exist or does not hold the DRIVER role.',
      });
    }

    // Check terminal statuses
    if (shipment.status === SHIPMENT_STATUS.DELIVERED || shipment.status === SHIPMENT_STATUS.CANCELLED) {
      return res.status(422).json({
        success: false,
        error: `Cannot assign driver to shipment in terminal status '${shipment.status}'.`,
      });
    }

    const isReassignment = !!shipment.assignedDriver;
    const oldDriverId = shipment.assignedDriver;

    shipment.assignedDriver = driver._id;

    // If shipment was CREATED, transition to ASSIGNED
    if (shipment.status === SHIPMENT_STATUS.CREATED) {
      shipment.status = SHIPMENT_STATUS.ASSIGNED;
    }

    shipment.statusHistory.push({
      status: shipment.status,
      changedBy: req.user._id,
      changedByRole: req.user.role,
      timestamp: new Date(),
      note: note || (isReassignment ? `Reassigned to driver ${driver.name}` : `Assigned to driver ${driver.name}`),
      location: 'Dispatch Hub',
    });

    await shipment.save();

    await recordSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      severity: 'INFO',
      req,
      userId: req.user._id,
      userRole: req.user.role,
      resource: '/api/admin/assign',
      action: 'POST',
      details: {
        shipmentId: shipment._id,
        trackingNumber: shipment.trackingNumber,
        newDriverId: driver._id,
        oldDriverId,
        isReassignment,
      },
    });

    const populatedShipment = await Shipment.findById(shipment._id)
      .populate('sender', 'name email phone')
      .populate('assignedDriver', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Driver ${driver.name} successfully assigned to shipment ${shipment.trackingNumber}.`,
      shipment: populatedShipment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Directory of customers, drivers, and admins
 * @access  Private (ADMIN)
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (role && Object.values(ROLES).includes(role)) {
      query.role = role;
    }

    if (search && typeof search === 'string') {
      const sanitized = search.trim().slice(0, 50);
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role phone createdAt failedLoginAttempts')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      users,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Query authentic security and authorization audit events
 * @access  Private (ADMIN)
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { eventType, severity, page = 1, limit = 50 } = req.query;

    const query = {};
    if (eventType) query.eventType = eventType;
    if (severity) query.severity = severity;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      SecurityLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      SecurityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      logs,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
