import { Router } from "express";
import * as indexerController from "../controllers/indexer.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { indexerAuth } from "../middleware/auth";

const router = Router();

router.post(
  "/transaction",
  indexerAuth,
  asyncHandler(indexerController.handleTransaction),
);

export default router;

