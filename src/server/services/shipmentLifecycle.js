const {
  SHIPMENT_STATUS,
  ALLOWED_TRANSITIONS,
  STATUS_TRANSITION_PERMISSIONS,
  ROLES,
} = require('../config/constants');
const { recordSecurityEvent } = require('./securityAudit');

/**
 * Validates whether a state transition is permitted by the Finite State Machine.
 */
function validateTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) {
    return {
      valid: false,
      reason: 'Both current status and target status are required.',
    };
  }

  if (currentStatus === targetStatus) {
    return {
      valid: false,
      reason: `Shipment is already in status '${currentStatus}'.`,
    };
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowedNextStatuses) {
    return {
      valid: false,
      reason: `Unknown or unhandled current status '${currentStatus}'.`,
    };
  }

  if (!allowedNextStatuses.includes(targetStatus)) {
    return {
      valid: false,
      reason: `Invalid state jump: Cannot transition directly from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${allowedNextStatuses.join(', ')}].`,
    };
  }

  return { valid: true };
}

/**
 * Validates whether the user's role has permission to trigger the requested target status.
 */
function validateRolePermission(userRole, targetStatus) {
  const allowedRoles = STATUS_TRANSITION_PERMISSIONS[targetStatus];
  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Role '${userRole}' is not authorized to transition shipments to '${targetStatus}'. Allowed roles: [${allowedRoles ? allowedRoles.join(', ') : 'None'}].`,
    };
  }
  return { allowed: true };
}

/**
 * Executes a controlled state transition on a shipment document.
 */
async function transitionShipmentStatus({
  shipment,
  targetStatus,
  user,
  note = '',
  location = '',
  req = null,
}) {
  const currentStatus = shipment.status;

  // 1. Validate FSM transition
  const fsmCheck = validateTransition(currentStatus, targetStatus);
  if (!fsmCheck.valid) {
    if (req) {
      await recordSecurityEvent({
        eventType: 'INVALID_STATE_TRANSITION',
        severity: 'WARN',
        req,
        userId: user._id,
        userRole: user.role,
        resource: `/api/shipments/${shipment._id}/status`,
        action: 'PATCH',
        details: {
          shipmentId: shipment._id,
          trackingNumber: shipment.trackingNumber,
          currentStatus,
          targetStatus,
          reason: fsmCheck.reason,
        },
      });
    }
    const error = new Error(fsmCheck.reason);
    error.statusCode = 422; // Unprocessable Entity
    throw error;
  }

  // 2. Validate role permission for the transition
  const roleCheck = validateRolePermission(user.role, targetStatus);
  if (!roleCheck.allowed) {
    if (req) {
      await recordSecurityEvent({
        eventType: 'FORBIDDEN_ROLE_ACTION',
        severity: 'HIGH',
        req,
        userId: user._id,
        userRole: user.role,
        resource: `/api/shipments/${shipment._id}/status`,
        action: 'PATCH',
        details: {
          shipmentId: shipment._id,
          currentStatus,
          targetStatus,
          reason: roleCheck.reason,
        },
      });
    }
    const error = new Error(roleCheck.reason);
    error.statusCode = 403; // Forbidden
    throw error;
  }

  // 3. For drivers, verify driver is actually assigned to this shipment
  if (user.role === ROLES.DRIVER) {
    const assignedId = shipment.assignedDriver?._id
      ? shipment.assignedDriver._id.toString()
      : shipment.assignedDriver
      ? shipment.assignedDriver.toString()
      : null;

    if (!assignedId || assignedId !== user._id.toString()) {
      if (req) {
        await recordSecurityEvent({
          eventType: 'FORBIDDEN_RESOURCE_ACCESS',
          severity: 'HIGH',
          req,
          userId: user._id,
          userRole: user.role,
          resource: `/api/shipments/${shipment._id}/status`,
          action: 'PATCH',
          details: {
            shipmentId: shipment._id,
            assignedDriver: assignedId,
            requestingDriver: user._id,
            reason: 'Driver attempted to transition status on unassigned shipment',
          },
        });
      }
      const error = new Error('You can only update status for shipments assigned to you.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 4. Apply transition
  shipment.status = targetStatus;
  shipment.statusHistory.push({
    status: targetStatus,
    changedBy: user._id,
    changedByRole: user.role,
    timestamp: new Date(),
    note: note || `Status transitioned to ${targetStatus}`,
    location: location || '',
  });

  if (targetStatus === SHIPMENT_STATUS.DELIVERED) {
    shipment.deliveredAt = new Date();
  }

  await shipment.save();
  return shipment;
}

module.exports = {
  validateTransition,
  validateRolePermission,
  transitionShipmentStatus,
};
