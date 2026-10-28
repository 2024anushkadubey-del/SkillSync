const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applied across all /api routes to prevent denial of service and API abuse.
 * Allows 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too Many Requests (429)',
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    });
  },
});

/**
 * Strict Authentication Rate Limiter
 * Applied specifically to sensitive auth endpoints (e.g. POST /api/auth/login)
 * to prevent automated credential stuffing and brute-force attacks.
 * Allows 10 login attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Too Many Requests (429)',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
