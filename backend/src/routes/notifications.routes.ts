import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireUser, requireAdmin } from "../middleware/authorize";
import { notificationSubscribeRateLimiter } from "../middleware/rateLimit";

const router = Router();

/** Authenticate is applied at parent in index.ts for protected routes. */

router.post(
  "/send",
  requireAdmin,
  asyncHandler(notificationController.send),
);

router.post(
  "/subscribe",
  requireUser,
  notificationSubscribeRateLimiter,
  asyncHandler(notificationController.subscribe),
);

router.post(
  "/preferences",
  requireUser,
  asyncHandler(notificationController.updatePreferences),
);

export default router;
