const mongoose = require('mongoose');
const { SECURITY_EVENT_TYPES, GUARD_DECISIONS } = require('../config/constants');

const securityLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARN', 'HIGH', 'CRITICAL'],
      default: 'INFO',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      default: 'Anonymous Actor',
    },
    actorEmail: {
      type: String,
      default: 'unauthenticated@probe.net',
    },
    userRole: {
      type: String,
      default: 'ANONYMOUS',
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: Object.values(GUARD_DECISIONS),
      default: GUARD_DECISIONS.ALLOW,
      index: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    reasons: {
      type: [String],
      default: [],
    },
    policiesTriggered: {
      type: [String],
      default: [],
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      default: null,
      index: true,
    },
    trackingNumber: {
      type: String,
      default: null,
      index: true,
    },
    previousState: {
      type: String,
      default: null,
    },
    requestedState: {
      type: String,
      default: null,
    },
    locationData: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      hub: { type: String, default: null },
      distanceKm: { type: Number, default: 0 },
      speedKmH: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 100 },
    },
    trustImpact: {
      previousTrust: { type: Number, default: 100 },
      newTrust: { type: Number, default: 100 },
      delta: { type: Number, default: 0 },
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'ShipTrack-ControlPlane/2.0',
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
