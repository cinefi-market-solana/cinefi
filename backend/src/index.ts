import "dotenv/config";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import apiRouter from "./routes";
import { env, allowedOrigins } from "./config/env";
import { logger } from "./lib/logger";
import { requestLogger } from "./middleware/requestLogger";
import { globalRateLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";

const port = env.PORT || 3000;
const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin ?? true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }),
);

app.use(compression());
app.use(requestLogger);
app.use(globalRateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.get("/health", (_req, res) => {
    res
        .status(StatusCodes.OK)
        .json({ success: true, data: { status: "ok" } });
});

app.use(errorHandler);

app.listen(port, () => {
    logger.info({ port }, "Express app listening");
});