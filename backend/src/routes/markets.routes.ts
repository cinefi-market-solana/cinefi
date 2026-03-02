import { Router } from "express";
import * as marketController from "../controllers/market.controller";
import * as adminController from "../controllers/admin.controller";
import { requireUser, requireAdmin } from "../middleware/authorize";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/** Authenticate is applied at parent in index.ts. */

// USER + ADMIN: list and read
router.get("/", requireUser, asyncHandler(marketController.getMarkets));
router.get("/:id", requireUser, asyncHandler(marketController.getMarketById));
router.get(
  "/:id/distribution",
  requireUser,
  asyncHandler(marketController.getMarketDistribution),
);
router.post("/:id/bets", requireUser, asyncHandler(marketController.createBet));
router.get("/:id/bets", requireUser, asyncHandler(marketController.getMarketBets));

// ADMIN only: create, edit, delete, resolve, close
router.post("/", requireAdmin, asyncHandler(adminController.createMarket));
router.patch("/:id/resolve", requireAdmin, asyncHandler(adminController.resolveMarket));
router.patch("/:id/close", requireAdmin, asyncHandler(adminController.closeMarket));
router.delete("/:id", requireAdmin, asyncHandler(adminController.deleteMarket));

export default router;
