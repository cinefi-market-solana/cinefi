import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireUser } from "../middleware/authorize";

const router = Router();

/** Authenticate is applied at parent in index.ts. */

router.get("/me", requireUser, asyncHandler(userController.getMe));
router.patch("/me", requireUser, asyncHandler(userController.updateMe));
router.patch("/me/fcm-token", requireUser, asyncHandler(userController.updateFcmToken));

router.post("/", requireUser, asyncHandler(userController.upsertUser));
router.get("/:walletAddress", requireUser, asyncHandler(userController.getUserProfile));
router.get(
  "/:walletAddress/bets",
  requireUser,
  asyncHandler(userController.getUserBets),
);

export default router;

