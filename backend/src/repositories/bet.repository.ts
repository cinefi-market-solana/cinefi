import prisma from "../lib/prisma";
import type { PaginationParams } from "../types/api";

export async function createBet(data: {
  userId: string;
  marketId: string;
  transactionSignature: string;
  predictedScore: number;
  stakeAmount: number;
}) {
  return prisma.bet.create({
    data,
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
        accuracyScore: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.bet.count({
      where: {
        userId,
        accuracyScore: { not: null },
      },
    }),
  ]);

  return {
    betCount: aggregates._count._all,
    totalStaked: aggregates._sum.stakeAmount ?? 0,
    totalPayout: aggregates._sum.payoutAmount ?? 0,
    totalAccuracy: aggregates._sum.accuracyScore ?? 0,
    resolvedBetCount: resolvedCount,
  };
}

export async function listBetsForMarketSimple(marketId: string) {
  return prisma.bet.findMany({
    where: { marketId },
    orderBy: { createdAt: "asc" },
  });
}

