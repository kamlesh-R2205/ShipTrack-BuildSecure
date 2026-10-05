const express = require('express');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const { ROLES, SHIPMENT_STATUS } = require('../config/constants');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/drivers/dashboard
 * @desc    Get dashboard metrics for authenticated driver
 * @access  Private (DRIVER)
 */
router.get('/dashboard', requireAuth, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [assigned, pending, deliveredToday, totalDelivered, recentShipments] = await Promise.all([
      // Total currently assigned (in progress)
      Shipment.countDocuments({
        assignedDriver: driverId,
        status: { $in: [SHIPMENT_STATUS.ASSIGNED, SHIPMENT_STATUS.PICKED_UP, SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.OUT_FOR_DELIVERY] },
      }),
      // Out for delivery right now
      Shipment.countDocuments({
        assignedDriver: driverId,
        status: SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      }),
      // Completed today
      Shipment.countDocuments({
        assignedDriver: driverId,
        status: SHIPMENT_STATUS.DELIVERED,
        deliveredAt: { $gte: startOfToday },
      }),
      // Total all-time deliveries completed
      Shipment.countDocuments({
        assignedDriver: driverId,
        status: SHIPMENT_STATUS.DELIVERED,
      }),
      // Recent assigned shipments
      Shipment.find({ assignedDriver: driverId })
        .populate('sender', 'name phone')
        .sort({ updatedAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activeAssigned: assigned,
        outForDelivery: pending,
        deliveredToday,
        totalCompleted: totalDelivered,
      },
      recentShipments,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/drivers/list
 * @desc    List all registered drivers (for Admin assignment workflows)
 * @access  Private (ADMIN)
 */
router.get('/list', requireAuth, requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const drivers = await User.find({ role: ROLES.DRIVER })
      .select('name email phone createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
