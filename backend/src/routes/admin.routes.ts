import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All routes under /api/admin use authenticate + requireAdmin in index.ts

router.post("/movies", asyncHandler(adminController.createMovie));
router.post("/markets", asyncHandler(adminController.createMarket));
router.post("/markets/:id/resolve", asyncHandler(adminController.resolveMarket));
router.patch("/markets/:id/close", asyncHandler(adminController.closeMarket));
router.delete("/markets/:id", asyncHandler(adminController.deleteMarket));

export default router;

