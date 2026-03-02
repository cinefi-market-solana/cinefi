import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  registerBodySchema,
  loginBodySchema,
  refreshBodySchema,
} from "../validators/auth.validator";
import * as authService from "../services/auth.service";
import type { SuccessResponse } from "../types/api";

export async function register(
  req: Request,
  res: Response<SuccessResponse<{ message: string }>>,
): Promise<void> {
  const body = registerBodySchema.parse(req.body);
  await authService.register(body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: { message: "Registration successful" },
  });
}

export async function login(
  req: Request,
  res: Response<SuccessResponse<{ user: authService.SessionUser; accessToken: string; refreshToken: string }>>,
): Promise<void> {
  const body = loginBodySchema.parse(req.body);
  const result = await authService.login(body);
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
}

export async function refresh(
  req: Request,
  res: Response<SuccessResponse<{ user: authService.SessionUser; accessToken: string }>>,
): Promise<void> {
  const body = refreshBodySchema.parse(req.body);
  const result = await authService.refreshAccessToken(body.refreshToken);
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
}
