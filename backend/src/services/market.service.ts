import { MarketStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import * as marketRepo from "../repositories/market.repository";
import * as betRepo from "../repositories/bet.repository";
import * as userRepo from "../repositories/user.repository";
import type { PaginationParams, PaginatedResult } from "../types/api";
import { AppError } from "../utils/appError";
import prisma from "../lib/prisma";

export async function listMarkets(
  pagination: PaginationParams,
): Promise<PaginatedResult<unknown>> {
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;

  const [items, total] = await Promise.all([
    marketRepo.listMarkets({ skip, take }),
    marketRepo.countMarkets(),
  ]);

  return { items, total, page: pagination.page, limit: pagination.limit };
}

export async function getMarketById(id: string) {
  const market = await marketRepo.getMarketById(id);
  if (!market) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Market not found",
      "MARKET_NOT_FOUND",
    );
  }
  return market;
}

export async function getMarketDistribution(id: string) {
  // TODO: Add caching (e.g. Redis) for market distribution once caching is implemented.
  const bets = await betRepo.listBetsForMarketSimple(id);
  if (bets.length === 0) {
    return [];
  }

  const bucketCounts = new Map<number, number>();

  for (const bet of bets) {
    const score = Number(bet.predictedScore);
    const bucket = Math.round(score * 2) / 2;
    const current = bucketCounts.get(bucket) ?? 0;
    bucketCounts.set(bucket, current + 1);
  }

  const distribution = Array.from(bucketCounts.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucket, count]) => ({ bucket, count }));

  return distribution;
}

export async function listBetsForMarket(params: {
  marketId: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<unknown>> {
  const { marketId, pagination } = params;

  const { items, total } = await betRepo.listBetsForMarket({
    marketId,
    pagination,
  });

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function createBetForMarket(params: {
  marketId: string;
  walletAddress: string;
  transactionSignature: string;
  predictedScore: number;
  stakeAmount: number;
}) {
  const {
    marketId,
    walletAddress,
    transactionSignature,
    predictedScore,
    stakeAmount,
  } = params;

  const existingBet = await betRepo.getBetByTransactionSignature(
    transactionSignature,
  );
  if (existingBet) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Bet already recorded for this transaction",
      "BET_ALREADY_EXISTS",
    );
  }

  // TODO: Integrate with Solana or another Web3 provider to validate
  // the transactionSignature and stakeAmount against on-chain data.

  const [market, user] = await Promise.all([
    marketRepo.getMarketById(marketId),
    userRepo.upsertUserByWallet(walletAddress),
  ]);

  if (!market) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Market not found",
      "MARKET_NOT_FOUND",
    );
  }

  if (market.status !== MarketStatus.OPEN) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Market is not open for betting",
      "MARKET_NOT_OPEN",
    );
  }

  const bet = await prisma.$transaction(async (txClient) => {
    const createdBet = await txClient.bet.create({
      data: {
        userId: user.id,
        marketId: market.id,
        transactionSignature,
        predictedScore,
        stakeAmount,
      },
    });

    const newBetCount = market.betCount + 1;
    const newTotalPool = Number(market.totalPool) + stakeAmount;
    const currentAgg = Number(market.predictedScoreAgg);
    const newPredictedAgg =
      (currentAgg * market.betCount + predictedScore) / newBetCount;

    await txClient.market.update({
      where: { id: market.id },
      data: {
        betCount: newBetCount,
        totalPool: newTotalPool,
        predictedScoreAgg: newPredictedAgg,
      },
    });

    return createdBet;
  });

  return bet;
}

export async function adminCreateMarket(params: {
  movieId: string;
  programAddress: string;
  switchboardFeedPubkey: string;
}) {
  const { movieId, programAddress, switchboardFeedPubkey } = params;
  const existingMarket = await marketRepo.getMarketByMovieId(movieId);

  if (existingMarket) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Market already exists for this movie",
      "MARKET_EXISTS",
    );
  }

  const market = await marketRepo.createMarket({
    movieId,
    programAddress,
    switchboardFeedPubkey,
  });

  return market;
}

export async function adminResolveMarket(params: {
  marketId: string;
  finalScore: number;
}) {
  const { marketId, finalScore } = params;

  const market = await marketRepo.getMarketWithBets(marketId);
  if (!market) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Market not found",
      "MARKET_NOT_FOUND",
    );
  }

  if (market.status === MarketStatus.RESOLVED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Market already resolved",
      "MARKET_ALREADY_RESOLVED",
    );
  }

  const bets = market.bets;
  if (bets.length === 0) {
    await marketRepo.updateMarketStatusAndFinalScore({
      marketId: market.id,
      status: MarketStatus.RESOLVED,
      finalScore,
      resolvedAt: new Date(),
    });
    return { marketId: market.id, updatedBets: 0 };
  }

  const resolvedAt = new Date();
  const scores = bets.map((bet) => {
    const predicted = Number(bet.predictedScore);
    const accuracy = 1 / (1 + Math.abs(predicted - finalScore));
    return { betId: bet.id, accuracy, stakeAmount: Number(bet.stakeAmount) };
  });

  const totalAccuracy = scores.reduce((sum, s) => sum + s.accuracy, 0);
  const totalPool = Number(market.totalPool);

  await prisma.$transaction(async (txClient) => {
    for (const score of scores) {
      const payout =
        totalAccuracy > 0
          ? (score.accuracy / totalAccuracy) * totalPool
          : 0;

      await txClient.bet.update({
        where: { id: score.betId },
        data: {
          accuracyScore: score.accuracy,
          payoutAmount: payout,
        },
      });
    }

    await txClient.market.update({
      where: { id: market.id },
      data: {
        status: MarketStatus.RESOLVED,
        finalScore,
        resolvedAt,
      },
    });
  });

  return { marketId: market.id, updatedBets: bets.length };
}

export async function adminCloseMarket(marketId: string) {
  const market = await marketRepo.getMarketById(marketId);
  if (!market) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Market not found",
      "MARKET_NOT_FOUND",
    );
  }
  if (market.status !== MarketStatus.OPEN) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Market is not open",
      "MARKET_NOT_OPEN",
    );
  }
  await marketRepo.updateMarketStatus(marketId, MarketStatus.CLOSED);
  return { marketId, status: MarketStatus.CLOSED };
}

export async function adminDeleteMarket(marketId: string) {
  const market = await marketRepo.getMarketById(marketId);
  if (!market) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Market not found",
      "MARKET_NOT_FOUND",
    );
  }
  await marketRepo.deleteMarket(marketId);
  return { marketId, deleted: true };
}

