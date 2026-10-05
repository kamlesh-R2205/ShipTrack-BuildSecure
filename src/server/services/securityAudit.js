const SecurityLog = require('../models/SecurityLog');

/**
 * Asynchronously log a security-relevant event to the database.
 * Does not throw errors so application request flow is never interrupted.
 */
async function recordSecurityEvent({
  eventType,
  severity = 'INFO',
  req,
  userId = null,
  userRole = 'ANONYMOUS',
  resource,
  action,
  details = {},
}) {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
      : 'SYSTEM';
    const userAgent = req ? req.headers['user-agent'] || 'UNKNOWN' : 'SYSTEM';

    await SecurityLog.create({
      eventType,
      severity,
      userId: userId || req?.user?._id || null,
      userRole: userRole || req?.user?.role || 'ANONYMOUS',
      resource: resource || req?.originalUrl || 'UNKNOWN',
      action: action || req?.method || 'UNKNOWN',
      ipAddress: String(ipAddress),
      userAgent: String(userAgent).slice(0, 200),
      details,
    });
  } catch (err) {
    // Fail silently in audit logger to avoid blocking core transactions
    console.error('[AUDIT_LOG_ERROR]', err.message);
  }
}

module.exports = {
  recordSecurityEvent,
};
