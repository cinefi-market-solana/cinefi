import type { NotificationType } from "@prisma/client";
import { logger } from "../lib/logger";
import * as userRepo from "../repositories/user.repository";
import * as notificationLogRepo from "../repositories/notificationLog.repository";

export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function subscribeUser(params: {
  walletAddress: string;
  fcmToken: string;
  genres: string[];
}) {
  const { walletAddress, fcmToken, genres } = params;
  return userRepo.updateUserNotificationPreferences({
    walletAddress,
    fcmToken,
    genres,
  });
}

export async function updatePreferences(params: {
  walletAddress: string;
  genres: string[];
}) {
  const { walletAddress, genres } = params;
  return userRepo.updateUserNotificationPreferences({
    walletAddress,
    genres,
  });
}

const MAX_FCM_TOKENS_PER_BATCH = 500;

export async function sendToUsers(
  userIds: string[],
  payload: NotificationPayload,
  type?: NotificationType,
  movieId?: string,
): Promise<void> {
  if (userIds.length === 0) return;

  // TODO: Implement Firebase push notifications using FCM.
  logger.warn(
    {
      userCount: userIds.length,
      hasType: Boolean(type),
      hasMovieId: Boolean(movieId),
    },
    "sendToUsers called but Firebase notifications are not implemented yet",
  );

  // We can still record notification logs for observability if requested.
  if (type && movieId) {
    const users = await userRepo.getUsersByIds(userIds);
    await Promise.all(
      users.map((u) =>
        notificationLogRepo.logNotification({
          userId: u.id,
          movieId,
          type,
        }),
      ),
    );
  }
}

