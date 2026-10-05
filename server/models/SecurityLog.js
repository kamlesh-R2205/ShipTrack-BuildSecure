const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        'AUTH_SUCCESS',
        'AUTH_FAILURE',
        'UNAUTHORIZED_ACCESS_ATTEMPT', // 401
        'FORBIDDEN_RESOURCE_ACCESS',   // 403 / BOLA / IDOR
        'FORBIDDEN_ROLE_ACTION',       // 403 RBAC
        'INVALID_STATE_TRANSITION',    // 422 FSM violation
        'VALIDATION_FAILURE',
        'SECURITY_ANOMALY',
      ],
      index: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARN', 'HIGH', 'CRITICAL'],
      default: 'INFO',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userRole: {
      type: String,
      default: 'ANONYMOUS',
    },
    resource: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: 'UNKNOWN',
    },
    userAgent: {
      type: String,
      default: 'UNKNOWN',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

securityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
