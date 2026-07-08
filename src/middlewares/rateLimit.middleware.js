import rateLimit from "express-rate-limit";

const contactLimiter = rateLimit({
  // Time window (default: 1 minute)
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,

  // Maximum requests allowed within the time window
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,

  // Return rate limit information in response headers
  standardHeaders: true,

  // Disable legacy X-RateLimit-* headers
  legacyHeaders: false,

  // Custom response when limit is exceeded
  message: {
    success: false,
    message: "Too many requests. Please try again after one minute.",
  },

  // Skip successful requests? (Keep false for demonstration)
  skipSuccessfulRequests: false,
});

export default contactLimiter;