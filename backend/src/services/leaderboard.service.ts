import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

type LeaderboardEntry = {
  walletAddress: string;
  avgAccuracy: number;
  betCount: number;
};

export async function getLeaderboard(
  limit = 50,
): Promise<LeaderboardEntry[]> {
  // TODO: Add caching (e.g. Redis) for leaderboard once caching is implemented.
  const rows = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      accuracyScore: { not: null },
    },
    _avg: {
      accuracyScore: true,
    },
    _count: {
      _all: true,
    },
    having: {
      _count: {
        _all: {
          gte: 3,
        },
      },
    } as Prisma.BetGroupByArgs["having"],
    orderBy: {
      _avg: {
        accuracyScore: "desc",
      },
    },
    take: limit,
  });

  if (rows.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.userId) } },
  });

  const userMap = new Map(users.map((u) => [u.id, u.walletAddress]));

  const leaderboard: LeaderboardEntry[] = rows.map((row) => ({
    walletAddress: userMap.get(row.userId) ?? "unknown",
    avgAccuracy: Number(row._avg.accuracyScore ?? 0),
    betCount: row._count._all,
  }));

  return leaderboard;
}

