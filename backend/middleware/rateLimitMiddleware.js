// Simple, robust in-memory rate limiter for chatbot endpoints
const rateLimitMap = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.windowStart > 60000) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

const chatbotRateLimiter = (options = {}) => {
    const windowMs = options.windowMs || 60 * 1000; // 1 minute
    const maxRequests = options.max || 30; // 30 requests per minute

    return (req, res, next) => {
        const identifier = (req.user && req.user.userId) || req.ip || "unknown";
        const now = Date.now();

        const record = rateLimitMap.get(identifier) || { count: 0, windowStart: now };

        if (now - record.windowStart > windowMs) {
            record.count = 1;
            record.windowStart = now;
        } else {
            record.count += 1;
        }

        rateLimitMap.set(identifier, record);

        if (record.count > maxRequests) {
            return res.status(429).json({
                message: "Too many messages sent. Please slow down and wait a moment before sending another message.",
                retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000)
            });
        }

        next();
    };
};

module.exports = chatbotRateLimiter;
