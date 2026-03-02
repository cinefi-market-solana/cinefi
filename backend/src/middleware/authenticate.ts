import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { Role } from "@prisma/client";

/** JWT payload shape from access tokens */
interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Extracts the Bearer token from the Authorization header.
 * @returns The token string or null if missing or not Bearer.
 */
function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * Authenticate middleware: verifies JWT and attaches user to the request.
 * - Reads Bearer token from Authorization header
 * - Verifies signature using JWT_SECRET (validated at startup in env; app throws if missing)
 * - Decodes payload { sub, email, role } and sets req.user = { id: sub, email, role }
 * - Returns 401 with { success: false, error: "Unauthorized", message: "..." } if token is missing or invalid
 * No Prisma/DB calls; role comes from the JWT.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
      message: "Missing or invalid authorization header",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.sub || !payload.email || payload.role == null) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid token payload",
      });
      return;
    }
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}
