import prisma from "../lib/prisma";
import type { PaginationParams } from "../types/api";

export async function createBet(data: {
  userId: string;
  marketId: string;
  transactionSignature: string;
  signingWallet: string;
  predictedScore: number;
  stakeAmount: number;
  dayOfPrediction: number;
  timeMultiplier: number;
}) {
  return prisma.bet.create({
    data: {
      userId: data.userId,
      marketId: data.marketId,
      transactionSignature: data.transactionSignature,
      signingWallet: data.signingWallet,
      predictedScore: data.predictedScore,
      stakeAmount: BigInt(data.stakeAmount),
      dayOfPrediction: data.dayOfPrediction,
      timeMultiplier: data.timeMultiplier,
    },
  });
}

export async function getBetByTransactionSignature(signature: string) {
  return prisma.bet.findUnique({
    where: { transactionSignature: signature },
  });
}

export async function listBetsForMarket(params: {
  marketId: string;
  pagination: PaginationParams;
}) {
  const { marketId, pagination } = params;
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;

  const [items, total] = await Promise.all([
    prisma.bet.findMany({
      where: { marketId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.bet.count({ where: { marketId } }),
  ]);

  return { items, total };
}

export async function listBetsForUser(params: {
  userId: string;
  pagination: PaginationParams;
}) {
  const { userId, pagination } = params;
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;

  const [items, total] = await Promise.all([
    prisma.bet.findMany({
      where: { userId },
      include: { market: { include: { movie: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.bet.count({ where: { userId } }),
  ]);

  return { items, total };
}

export async function getUserStats(userId: string) {
  const [aggregates, resolvedCount] = await Promise.all([
    prisma.bet.aggregate({
      where: { userId },
      _sum: {
        stakeAmount: true,
        payoutAmount: true,
      },
      _count: { id: true },
    }),
    prisma.bet.count({
      where: {
        userId,
        payoutAmount: { not: null },
      },
    }),
  ]);

  return {
    betCount: aggregates._count.id,
    totalStaked: aggregates._sum.stakeAmount ?? 0n,
    totalPayout: aggregates._sum.payoutAmount ?? 0,
    totalAccuracy: 0,
    resolvedBetCount: resolvedCount,
  };
}

export async function listBetsForMarketSimple(marketId: string) {
  return prisma.bet.findMany({
    where: { marketId },
    orderBy: { createdAt: "asc" },
  });
}

