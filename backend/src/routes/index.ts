import { Router } from "express";
import authRouter from "./auth.routes";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use("/auth", authRouter);

router.use(authenticate);

// Other routes

export default router;