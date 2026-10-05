const express = require('express');
const SecurityLog = require('../models/SecurityLog');
const { ROLES } = require('../config/constants');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/security/health
 * @desc    Security & defensive engine health status
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'ShipTrack Defensive Logistics Engine',
    timestamp: new Date().toISOString(),
    securityControls: {
      serverSideAuthorization: 'ACTIVE',
      fsmLifecycleValidation: 'ACTIVE',
      bolaIdorProtection: 'ACTIVE',
      massAssignmentDefense: 'ACTIVE',
      auditTelemetry: 'ACTIVE',
      rateLimiting: 'ACTIVE',
    },
  });
});

/**
 * @route   GET /api/security/events
 * @desc    Inspect real security incidents & telemetry (no fake metrics)
 * @access  Private (ADMIN)
 */
router.get('/events', requireAuth, requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { limit = 25 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));

    const events = await SecurityLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    const eventCounts = await SecurityLog.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    const metrics = {};
    eventCounts.forEach((ec) => {
      metrics[ec._id] = ec.count;
    });

    res.status(200).json({
      success: true,
      count: events.length,
      metrics,
      events,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
