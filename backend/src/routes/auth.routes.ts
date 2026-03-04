import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));

router.post("/verify", asyncHandler(authController.verifyUser));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/reset-password", asyncHandler(authController.resetPassword));

export default router;