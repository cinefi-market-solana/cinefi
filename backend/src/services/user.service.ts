import { StatusCodes } from "http-status-codes";
import * as userRepo from "../repositories/user.repository";
import * as betRepo from "../repositories/bet.repository";
import type { PaginationParams, PaginatedResult } from "../types/api";
import { AppError } from "../utils/appError";

export async function upsertUser(walletAddress: string) {
  return userRepo.upsertUserByWallet(walletAddress);
}

export async function getUserProfile(walletAddress: string) {
  const user = await userRepo.getUserByWallet(walletAddress);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "USER_NOT_FOUND",
    );
  }

  const stats = await betRepo.getUserStats(user.id);

  const avgAccuracy =
    stats.resolvedBetCount > 0
      ? Number(stats.totalAccuracy) / stats.resolvedBetCount
      : 0;

  return {
    email: user.email,
    betCount: stats.betCount,
    avgAccuracy,
    totalStaked: Number(stats.totalStaked),
    totalPayout: Number(stats.totalPayout),
  };
}

export async function getUserBets(params: {
  walletAddress: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<unknown>> {
  const { walletAddress, pagination } = params;
  const user = await userRepo.getUserByWallet(walletAddress);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "USER_NOT_FOUND",
    );
  }

  const { items, total } = await betRepo.listBetsForUser({
    userId: user.id,
    pagination,
  });

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

