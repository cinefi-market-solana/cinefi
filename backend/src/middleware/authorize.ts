import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

export function requireRole(...allowedRoles: Role[]) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole(Role.ADMIN);
export const requireUser = requireRole(Role.USER, Role.ADMIN);