const rateLimit = require('express-rate-limit');

//rate limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: "Too many authentication attempts. Try again later.",
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

//General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: "Too many requests. Try again later.",
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

//Strict rate limiter for sensitive routes
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: "Too many requests. Try again later.",
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, strictLimiter };