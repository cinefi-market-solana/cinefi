import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req);
  if (!token || token !== env.ADMIN_SECRET) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or missing admin credentials",
      },
    });
    return;
  }
  next();
}

export const indexerAuth = adminAuth;

