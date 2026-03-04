import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { Role } from "@prisma/client";

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

function extractBearerToken(req: Request): string | null {
  const raw = req.headers.authorization;
  if (!raw) return null;
  const header = raw.trim();
  if (!header) return null;
  const [scheme, token] = header.split(/\s+/);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  const trimmedToken = token.trim();
  if (!trimmedToken) return null;
  return trimmedToken;
}

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
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid token payload",
      });
      return;
    }

    const maybePayload = decoded as Partial<JwtPayload>;

    if (
      typeof maybePayload.sub !== "string" ||
      typeof maybePayload.email !== "string" ||
      !maybePayload.role ||
      !Object.values(Role).includes(maybePayload.role)
    ) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid token payload",
      });
      return;
    }

    req.user = {
      id: maybePayload.sub,
      email: maybePayload.email,
      role: maybePayload.role,
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