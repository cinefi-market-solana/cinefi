import type { NotificationType } from "@prisma/client";
import prisma from "../lib/prisma";

export async function hasNotificationBeenSent(params: {
  userId: string;
  movieId: string;
  type: NotificationType;
}) {
  const { userId, movieId, type } = params;
  const existing = await prisma.notificationLog.findUnique({
    where: {
      userId_movieId_type: {
        userId,
        movieId,
        type,
      },
    },
  });
  return Boolean(existing);
}

export async function logNotification(params: {
  userId: string;
  movieId: string;
  type: NotificationType;
}) {
  const { userId, movieId, type } = params;
  return prisma.notificationLog.create({
    data: { userId, movieId, type },
  });
}

