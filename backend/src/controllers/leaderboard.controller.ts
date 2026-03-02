import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as leaderboardService from "../services/leaderboard.service";
import type { SuccessResponse } from "../types/api";
import { paginationQuerySchema } from "../validators/common";

export async function getLeaderboard(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const parsed = paginationQuerySchema.parse(req.query);
  const leaderboard = await leaderboardService.getLeaderboard(parsed.limit);
  res.status(StatusCodes.OK).json({
    success: true,
    data: leaderboard,
  });
}

