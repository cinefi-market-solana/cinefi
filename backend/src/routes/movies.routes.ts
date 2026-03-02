import { Router } from "express";
import * as movieController from "../controllers/movie.controller";
import * as adminController from "../controllers/admin.controller";
import { requireUser, requireAdmin } from "../middleware/authorize";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/** Authenticate is applied at parent in index.ts. */

// USER + ADMIN: list and read
router.get("/", requireUser, asyncHandler(movieController.getMovies));
router.get("/:id", requireUser, asyncHandler(movieController.getMovieById));

// ADMIN only: create (edit/delete can be added when handlers exist)
router.post("/", requireAdmin, asyncHandler(adminController.createMovie));

export default router;
