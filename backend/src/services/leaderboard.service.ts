import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

type LeaderboardEntry = {
  email: string;
  totalPayout: number;
  betCount: number;
};

export async function getLeaderboard(
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const rows = await prisma.bet.groupBy({
    by: ["userId"],
    where: {
      payoutAmount: { not: null },
    },
    _sum: {
      payoutAmount: true,
    },
    _count: { id: true },
    having: {
      _count: {
        id: { gte: 3 },
      },
    } as Prisma.BetGroupByArgs["having"],
    orderBy: {
      _sum: {
        payoutAmount: "desc",
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

  const userMap = new Map(users.map((u) => [u.id, u.email]));

  const leaderboard: LeaderboardEntry[] = rows.map((row) => ({
    email: userMap.get(row.userId) ?? "unknown",
    totalPayout: Number(row._sum.payoutAmount ?? 0),
    betCount: row._count.id,
  }));

  return leaderboard;
}

