/**
 * Centralized Secure Error Handling Middleware
 * Protects against information leakage by suppressing raw stack traces
 * and sanitizing internal errors into standard JSON responses.
 */

// 404 Handler for undefined API routes
const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    error: 'Not Found (404)',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist on this server.`,
  });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation Error: ${errors.join('. ')}`;
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value error: An account with this ${field} already exists.`;
  }

  // Handle Mongoose CastError (Invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with the specified format for field '${err.path}'.`;
  }

  // Handle JWT verification errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication session token has expired. Please log in again.';
  }

  // Log server-side for internal diagnostics (without leaking to client)
  if (statusCode === 500) {
    console.error('[Unhandled Server Error]:', err);
    message = 'An unexpected internal error occurred on the server. Please try again later.';
  }

  return res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : (err.name || 'Error'),
    message,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
