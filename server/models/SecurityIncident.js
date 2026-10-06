const mongoose = require('mongoose');
const { INCIDENT_SEVERITY, INCIDENT_STATUS } = require('../config/constants');

const securityIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      default: INCIDENT_SEVERITY.HIGH,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(INCIDENT_STATUS),
      default: INCIDENT_STATUS.OPEN,
      index: true,
    },
    threatType: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: 'Unknown Actor' },
      email: { type: String, default: 'anonymous@probe.net' },
      role: { type: String, default: 'UNAUTHENTICATED' },
      ipAddress: { type: String, default: '127.0.0.1' },
    },
    affectedShipment: {
      shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', default: null },
      trackingNumber: { type: String, default: null },
    },
    attackChain: [
      {
        step: { type: Number, required: true },
        title: { type: String, required: true },
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    policiesViolated: {
      type: [String],
      default: [],
    },
    recommendedAction: {
      type: String,
      default: 'STEP_UP_VERIFICATION_OR_RESTRICT',
    },
    actionsTaken: [
      {
        action: { type: String, required: true },
        executedAt: { type: Date, default: Date.now },
        executedBy: { type: String, default: 'SYSTEM_AUTOPILOT' },
        note: { type: String, default: '' },
      },
    ],
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

securityIncidentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('SecurityIncident', securityIncidentSchema);
