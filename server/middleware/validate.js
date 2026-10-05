const mongoose = require('mongoose');

/**
 * Validates registration input and defends against Mass Assignment.
 * Hardcodes or restricts role assignment so public registrants cannot escalate to ADMIN.
 */
function validateRegister(req, res, next) {
  const { name, email, password, role, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Valid name (min 2 characters) is required.',
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long.',
    });
  }

  // MASS ASSIGNMENT DEFENSE:
  // Public registration only allows CUSTOMER or DRIVER.
  // ADMIN role can NEVER be self-assigned via public registration.
  let assignedRole = 'CUSTOMER';
  if (role === 'DRIVER') {
    assignedRole = 'DRIVER';
  } else if (role === 'ADMIN') {
    // Flag or downgrade attempt silently/explicitly
    return res.status(403).json({
      success: false,
      error: 'Privilege escalation blocked: Cannot register as ADMIN directly.',
    });
  }

  // Sanitize and replace body with strictly allowlisted attributes
  req.sanitizedBody = {
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase(),
    password: password,
    role: assignedRole,
    phone: typeof phone === 'string' ? phone.trim().slice(0, 20) : '',
  };

  next();
}

/**
 * Validates login input.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  req.sanitizedBody = {
    email: email.trim().toLowerCase(),
    password: password,
  };

  next();
}

/**
 * Validates shipment creation payload.
 */
function validateShipmentCreate(req, res, next) {
  const { senderDetails, receiverDetails, packageDetails, estimatedDeliveryDate } = req.body;

  if (!senderDetails || !receiverDetails || !packageDetails) {
    return res.status(400).json({
      success: false,
      error: 'Sender details, receiver details, and package details are mandatory.',
    });
  }

  // Validate sender details
  if (
    !senderDetails.name ||
    !senderDetails.phone ||
    !senderDetails.address ||
    !senderDetails.city ||
    !senderDetails.postalCode
  ) {
    return res.status(400).json({
      success: false,
      error: 'All sender fields (name, phone, address, city, postalCode) are required.',
    });
  }

  // Validate receiver details
  if (
    !receiverDetails.name ||
    !receiverDetails.phone ||
    !receiverDetails.address ||
    !receiverDetails.city ||
    !receiverDetails.postalCode
  ) {
    return res.status(400).json({
      success: false,
      error: 'All receiver fields (name, phone, address, city, postalCode) are required.',
    });
  }

  // Validate package details
  const weight = Number(packageDetails.weightKg);
  if (isNaN(weight) || weight <= 0 || weight > 500) {
    return res.status(400).json({
      success: false,
      error: 'Package weight must be a positive number up to 500 kg.',
    });
  }

  if (!packageDetails.description || typeof packageDetails.description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Package description is required.',
    });
  }

  // Allowlist construction to prevent mass assignment
  req.sanitizedBody = {
    senderDetails: {
      name: String(senderDetails.name).trim().slice(0, 100),
      phone: String(senderDetails.phone).trim().slice(0, 20),
      address: String(senderDetails.address).trim().slice(0, 200),
      city: String(senderDetails.city).trim().slice(0, 100),
      postalCode: String(senderDetails.postalCode).trim().slice(0, 20),
    },
    receiverDetails: {
      name: String(receiverDetails.name).trim().slice(0, 100),
      phone: String(receiverDetails.phone).trim().slice(0, 20),
      address: String(receiverDetails.address).trim().slice(0, 200),
      city: String(receiverDetails.city).trim().slice(0, 100),
      postalCode: String(receiverDetails.postalCode).trim().slice(0, 20),
    },
    packageDetails: {
      weightKg: weight,
      description: String(packageDetails.description).trim().slice(0, 500),
      isFragile: Boolean(packageDetails.isFragile),
      declaredValue: Number(packageDetails.declaredValue) || 0,
      dimensions: {
        lengthCm: Number(packageDetails.dimensions?.lengthCm) || 0,
        widthCm: Number(packageDetails.dimensions?.widthCm) || 0,
        heightCm: Number(packageDetails.dimensions?.heightCm) || 0,
      },
    },
    estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
  };

  next();
}

/**
 * Validates ObjectId parameter.
 */
function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid identifier provided in parameter '${paramName}'.`,
      });
    }
    next();
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateShipmentCreate,
  validateObjectId,
};
