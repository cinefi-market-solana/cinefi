import { Router } from "express";
import * as leaderboardController from "../controllers/leaderboard.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireUser } from "../middleware/authorize";

const router = Router();

/** Authenticate is applied at parent in index.ts. */

router.get("/", requireUser, asyncHandler(leaderboardController.getLeaderboard));

export default router;

