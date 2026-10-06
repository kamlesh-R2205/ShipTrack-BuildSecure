const mongoose = require('mongoose');
const { INCIDENT_SEVERITY } = require('../config/constants');

const securityPolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'IDENTITY_SECURITY',
        'RESOURCE_SECURITY',
        'WORKFLOW_SECURITY',
        'REALITY_SECURITY',
        'HONEYPOT_SECURITY',
        'BEHAVIORAL_SECURITY',
        'ADAPTIVE_TRUST',
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ['ENFORCING', 'MONITORING', 'DISABLED'],
      default: 'ENFORCING',
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(INCIDENT_SEVERITY),
      default: INCIDENT_SEVERITY.HIGH,
    },
    description: {
      type: String,
      required: true,
    },
    trigger: {
      type: String,
      required: true,
    },
    responseAction: {
      type: String,
      required: true,
    },
    enforcementCount: {
      type: Number,
      default: 0,
    },
    lastTriggered: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

securityPolicySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('SecurityPolicy', securityPolicySchema);
