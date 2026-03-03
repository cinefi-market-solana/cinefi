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
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return null;
    return token;
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