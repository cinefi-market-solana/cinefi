import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      },
      "HTTP request completed",
    );
  });

  next();
}

