/**
 * Centralized defensive error handler.
 * Never leaks stack traces, database internals, or server file paths to the client.
 */
function errorHandler(err, req, res, next) {
  // Log full error details securely on the server
  console.error(`[SERVER_ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // User-friendly secure messages for common errors
  let clientMessage = err.message || 'An unexpected internal error occurred.';

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    clientMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    return res.status(409).json({
      success: false,
      error: clientMessage,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join('. '),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Invalid or expired token.',
    });
  }

  // Avoid leaking raw internal 500 error messages in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    clientMessage = 'Internal server error. The security operations team has been notified.';
  }

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
  });
}

/**
 * 404 Route Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
