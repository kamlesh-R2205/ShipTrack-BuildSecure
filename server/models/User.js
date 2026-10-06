const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // ShipTrack Guard Adaptive Trust
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    trustStatus: {
      type: String,
      enum: ['NORMAL', 'MONITOR', 'STEP_UP', 'RESTRICTED', 'BLOCKED'],
      default: 'NORMAL',
    },
    trustHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        delta: { type: Number, required: true },
        newScore: { type: Number, required: true },
        reason: { type: String, required: true },
        eventId: { type: String, default: null },
      },
    ],
    assignedHub: {
      type: String,
      default: 'HYD-CENTRAL-01',
    },
    lastKnownLocation: {
      lat: { type: Number, default: 17.385 },
      lng: { type: Number, default: 78.4867 },
      name: { type: String, default: 'Hyderabad Central Hub' },
      timestamp: { type: Date, default: Date.now },
      deviceId: { type: String, default: 'DEV-TEL-01' },
    },
    isHoneypotTriggered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mask sensitive user fields for API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
