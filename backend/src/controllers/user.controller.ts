import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { paginationQuerySchema } from "../validators/common";
import { upsertUserBodySchema } from "../validators/user.validator";
import * as userService from "../services/user.service";
import type { PaginatedResponse, SuccessResponse } from "../types/api";

/** Get current user profile (from JWT). */
export async function getMe(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
      message: "Not authenticated",
    });
    return;
  }
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

/** Update own profile. Not implemented. */
export async function updateMe(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Update profile is not implemented yet",
  });
}

/** Update FCM token. Not implemented. */
export async function updateFcmToken(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Update FCM token is not implemented yet",
  });
}

export async function upsertUser(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = upsertUserBodySchema.parse(req.body);
  const user = await userService.upsertUser(body.walletAddress);
  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
}

export async function getUserProfile(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const { walletAddress } = req.params;
  const profile = await userService.getUserProfile(walletAddress);
  res.status(StatusCodes.OK).json({
    success: true,
    data: profile,
  });
}

export async function getUserBets(
  req: Request,
  res: Response<PaginatedResponse<unknown>>,
): Promise<void> {
  const parsed = paginationQuerySchema.parse(req.query);
  const { walletAddress } = req.params;

  const result = await userService.getUserBets({
    walletAddress,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
}

