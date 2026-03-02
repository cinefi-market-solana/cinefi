import type { MarketStatus } from "@prisma/client";
import prisma from "../lib/prisma";

export async function listMarkets(params: { skip: number; take: number }) {
  return prisma.market.findMany({
    skip: params.skip,
    take: params.take,
    include: {
      movie: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countMarkets() {
  return prisma.market.count();
}

export async function getMarketById(id: string) {
  return prisma.market.findUnique({
    where: { id },
    include: { movie: true },
  });
}

export async function getMarketWithBets(id: string) {
  return prisma.market.findUnique({
    where: { id },
    include: {
      movie: true,
      bets: true,
    },
  });
}

export async function createMarket(data: {
  movieId: string;
  programAddress: string;
  switchboardFeedPubkey: string;
  winRadius?: number;
  baseMintBet?: number | bigint;
  marketOpenDate?: Date;
  bettingClosesAt?: Date;
}) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return prisma.market.create({
    data: {
      movieId: data.movieId,
      programAddress: data.programAddress,
      switchboardFeedPubkey: data.switchboardFeedPubkey,
      winRadius: data.winRadius ?? 5,
      baseMintBet: BigInt(data.baseMintBet ?? 1_000_000_000),
      marketOpenDate: data.marketOpenDate ?? now,
      bettingClosesAt: data.bettingClosesAt ?? weekFromNow,
    },
  });
}

export async function getMarketByMovieId(movieId: string) {
  return prisma.market.findFirst({
    where: { movieId },
  });
}

export async function updateMarketStatus(marketId: string, status: MarketStatus) {
  return prisma.market.update({
    where: { id: marketId },
    data: { status },
  });
}

export async function updateMarketStatusAndFinalScore(params: {
  marketId: string;
  status: MarketStatus;
  finalScore: number;
  resolvedAt: Date;
}) {
  const { marketId, status, finalScore, resolvedAt } = params;

  return prisma.market.update({
    where: { id: marketId },
    data: {
      status,
      finalScore,
      resolvedAt,
    },
  });
}

export async function deleteMarket(marketId: string) {
  return prisma.market.delete({
    where: { id: marketId },
  });
}

export async function updateMarketAggregates(params: {
  marketId: string;
  totalPool: number;
  betCount: number;
  averageCrowdPrediction: number;
}) {
  const { marketId, totalPool, betCount, averageCrowdPrediction } = params;

  return prisma.market.update({
    where: { id: marketId },
    data: {
      totalPool,
      betCount,
      averageCrowdPrediction,
    },
  });
}

