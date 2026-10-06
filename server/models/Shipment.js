const mongoose = require('mongoose');
const { SHIPMENT_STATUS } = require('../config/constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByRole: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    locationTrust: {
      type: Number,
      default: 100,
    },
  },
  { _id: true }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    senderDetails: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    receiverDetails: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    packageDetails: {
      weightKg: { type: Number, required: true, min: [0.01, 'Weight must be > 0'] },
      description: { type: String, required: true, trim: true, maxlength: 500 },
      isFragile: { type: Boolean, default: false },
      declaredValue: { type: Number, default: 0, min: 0 },
      dimensions: {
        lengthCm: { type: Number, default: 0 },
        widthCm: { type: Number, default: 0 },
        heightCm: { type: Number, default: 0 },
      },
    },
    status: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.CREATED,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    // ShipTrack Guard — Shipment DNA & Security Controls
    isHoneypot: {
      type: Boolean,
      default: false,
      index: true,
    },
    securityStatus: {
      type: String,
      enum: ['HEALTHY', 'SUSPICIOUS', 'HIGH_RISK', 'CRITICAL'],
      default: 'HEALTHY',
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dna: {
      expectedRoute: {
        type: [String],
        default: ['Hyderabad Central Hub', 'Suryapet Transit Hub', 'Vijayawada DC', 'Destination Address'],
      },
      actualRoute: [
        {
          checkpoint: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          location: { type: String, required: true },
          lat: { type: Number, default: 0 },
          lng: { type: Number, default: 0 },
          verified: { type: Boolean, default: true },
        },
      ],
      expectedTransitHours: { type: Number, default: 6 },
      workflowDeviations: [
        {
          type: { type: String, required: true },
          detectedAt: { type: Date, default: Date.now },
          expected: { type: String, required: true },
          actual: { type: String, required: true },
          severity: { type: String, default: 'HIGH' },
        },
      ],
      locationTrustScore: { type: Number, default: 95 },
      deviceFingerprints: { type: [String], default: ['DEV-TEL-01'] },
      accessLogsCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

shipmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Shipment', shipmentSchema);
