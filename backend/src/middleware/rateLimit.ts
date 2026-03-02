import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

export const GLOBAL_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const GLOBAL_RATE_LIMIT_MAX = 1000;
export const NOTIFICATION_SUBSCRIBE_RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const NOTIFICATION_SUBSCRIBE_RATE_LIMIT_MAX = 5;

export const globalRateLimiter = rateLimit({
  windowMs: GLOBAL_RATE_LIMIT_WINDOW_MS,
  max: GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later.",
      },
    });
  },
});

export const notificationSubscribeRateLimiter = rateLimit({
  windowMs: NOTIFICATION_SUBSCRIBE_RATE_LIMIT_WINDOW_MS,
  max: NOTIFICATION_SUBSCRIBE_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many subscription attempts, please try again later.",
      },
    });
  },
});

