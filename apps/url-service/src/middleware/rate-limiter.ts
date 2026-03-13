import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
