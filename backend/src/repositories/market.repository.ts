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
}) {
  return prisma.market.create({
    data,
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
  predictedScoreAgg: number;
}) {
  const { marketId, totalPool, betCount, predictedScoreAgg } = params;

  return prisma.market.update({
    where: { id: marketId },
    data: {
      totalPool,
      betCount,
      predictedScoreAgg,
    },
  });
}

