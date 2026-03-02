import { Router } from "express";
import authRouter from "./auth.routes";
import moviesRouter from "./movies.routes";
import marketsRouter from "./markets.routes";
import usersRouter from "./users.routes";
import notificationsRouter from "./notifications.routes";
import leaderboardRouter from "./leaderboard.routes";
import adminRouter from "./admin.routes";
import indexerRouter from "./indexer.routes";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/authorize";
import { indexerAuth } from "../middleware/auth";

const router = Router();

// Public — no authentication required
router.use("/auth", authRouter);

router.use("/markets", authenticate, marketsRouter);
router.use("/movies", authenticate, moviesRouter);
router.use("/users", authenticate, usersRouter);
router.use("/notifications", authenticate, notificationsRouter);
router.use("/leaderboard", authenticate, leaderboardRouter);

router.use("/admin", authenticate, requireAdmin, adminRouter);

router.use("/indexer", indexerAuth, indexerRouter);

export default router;
