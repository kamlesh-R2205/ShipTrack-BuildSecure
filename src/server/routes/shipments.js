const express = require('express');
const Shipment = require('../models/Shipment');
const { ROLES, SHIPMENT_STATUS } = require('../config/constants');
const { requireAuth, authorizeShipmentAccess } = require('../middleware/auth');
const { validateShipmentCreate } = require('../middleware/validate');
const { generateTrackingNumber } = require('../utils/trackingGenerator');
const { transitionShipmentStatus } = require('../services/shipmentLifecycle');
const { recordSecurityEvent } = require('../services/securityAudit');

const router = express.Router();

/**
 * @route   POST /api/shipments
 * @desc    Create a new shipment (Customer or Admin)
 * @access  Private (CUSTOMER, ADMIN)
 */
router.post('/', requireAuth, validateShipmentCreate, async (req, res, next) => {
  try {
    const { senderDetails, receiverDetails, packageDetails, estimatedDeliveryDate } = req.sanitizedBody;

    const trackingNumber = generateTrackingNumber();

    const shipment = await Shipment.create({
      trackingNumber,
      sender: req.user._id,
      senderDetails,
      receiverDetails,
      packageDetails,
      status: SHIPMENT_STATUS.CREATED,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: req.user._id,
          changedByRole: req.user.role,
          timestamp: new Date(),
          note: 'Shipment created and registered in logistics system.',
          location: senderDetails.city,
        },
      ],
      estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default 3 days
    });

    await recordSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      severity: 'INFO',
      req,
      userId: req.user._id,
      userRole: req.user.role,
      resource: '/api/shipments',
      action: 'POST',
      details: { trackingNumber, shipmentId: shipment._id },
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully.',
      shipment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/shipments
 * @desc    List shipments with role-enforced segregation & filtering
 *          - CUSTOMER: strictly restricted to own shipments
 *          - DRIVER: strictly restricted to assigned shipments
 *          - ADMIN: global visibility across all shipments
 * @access  Private
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // 1. Enforce strict server-side tenant boundary
    if (req.user.role === ROLES.CUSTOMER) {
      query.sender = req.user._id;
    } else if (req.user.role === ROLES.DRIVER) {
      query.assignedDriver = req.user._id;
    }
    // ADMIN has no default owner filter

    // 2. Filter by status if provided and valid
    if (status && Object.values(SHIPMENT_STATUS).includes(status)) {
      query.status = status;
    }

    // 3. Search filter (tracking number or receiver name)
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.trim().slice(0, 50);
      query.$or = [
        { trackingNumber: { $regex: sanitizedSearch, $options: 'i' } },
        { 'receiverDetails.name': { $regex: sanitizedSearch, $options: 'i' } },
        { 'receiverDetails.city': { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate('sender', 'name email phone')
        .populate('assignedDriver', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Shipment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      shipments,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/shipments/:id
 * @desc    Get shipment by ID with strict Object-Level Authorization (IDOR Defense)
 * @access  Private (Owner, Assigned Driver, or Admin)
 */
router.get('/:id', requireAuth, authorizeShipmentAccess('id'), async (req, res) => {
  // req.shipment is verified and attached by authorizeShipmentAccess middleware
  res.status(200).json({
    success: true,
    shipment: req.shipment,
  });
});

/**
 * @route   PATCH /api/shipments/:id/status
 * @desc    Update shipment status with strict Finite State Machine and Role Authorization
 * @access  Private (Assigned Driver or Admin)
 */
router.patch('/:id/status', requireAuth, authorizeShipmentAccess('id'), async (req, res, next) => {
  try {
    const { targetStatus, note, location } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        error: 'targetStatus is required in request body.',
      });
    }

    const updatedShipment = await transitionShipmentStatus({
      shipment: req.shipment,
      targetStatus,
      user: req.user,
      note: typeof note === 'string' ? note.slice(0, 300) : '',
      location: typeof location === 'string' ? location.slice(0, 150) : '',
      req,
    });

    res.status(200).json({
      success: true,
      message: `Shipment status successfully transitioned to ${targetStatus}.`,
      shipment: updatedShipment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/shipments/tracking/:trackingNumber
 * @desc    Public tracking endpoint with PII Data Minimization
 * @access  Public
 */
router.get('/tracking/:trackingNumber', async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid tracking number is required.',
      });
    }

    const shipment = await Shipment.findOne({
      trackingNumber: trackingNumber.trim().toUpperCase(),
    }).select('-sender -assignedDriver');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Tracking number not found in our records.',
      });
    }

    // Mask sensitive PII for public tracking
    const maskText = (str) => {
      if (!str || str.length <= 2) return '***';
      return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    };

    const maskedPublicData = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      originCity: shipment.senderDetails.city,
      destinationCity: shipment.receiverDetails.city,
      receiverNameMasked: maskText(shipment.receiverDetails.name),
      isFragile: shipment.packageDetails.isFragile,
      weightKg: shipment.packageDetails.weightKg,
      statusHistory: shipment.statusHistory.map((h) => ({
        status: h.status,
        timestamp: h.timestamp,
        note: h.note,
        location: h.location,
      })),
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      deliveredAt: shipment.deliveredAt,
    };

    res.status(200).json({
      success: true,
      data: maskedPublicData,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
