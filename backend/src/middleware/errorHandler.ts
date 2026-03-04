import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import { logger } from "../lib/logger";
import type { ErrorResponse } from "../types/api";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.error({ err }, "Zod validation error");

    const message =
      env.NODE_ENV === "production"
        ? "Invalid request data"
        : JSON.stringify(err.issues);

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    });
    return;
  }

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  logger.error({ err }, "Unhandled error");

  const message =
    env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  });
}

