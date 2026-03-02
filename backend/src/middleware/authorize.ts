import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

/**
 * Middleware factory: requires req.user.role to be one of the allowed roles.
 * Use after authenticate so req.user is set.
 * Returns 403 with { success: false, error: "Forbidden", message: "Insufficient permissions" }
 * if the user is missing or their role is not in the allowed list.
 * No Prisma/DB calls; role is read from req.user (JWT).
 */
export function requireRole(...allowedRoles: Role[]) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: "Forbidden",
        message: "Insufficient permissions",
      });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: "Forbidden",
        message: "Insufficient permissions",
      });
      return;
    }
    next();
  };
}

/** Admin-only guard. Use after authenticate. */
export const requireAdmin = requireRole(Role.ADMIN);

/** Any authenticated user (USER or ADMIN). Use after authenticate. */
export const requireUser = requireRole(Role.USER, Role.ADMIN);
