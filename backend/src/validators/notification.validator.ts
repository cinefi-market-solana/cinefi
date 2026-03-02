import { z } from "zod";
import { walletAddressSchema } from "./common";

export const notificationSubscribeSchema = z.object({
  walletAddress: walletAddressSchema,
  fcmToken: z.string().min(1),
  genres: z.array(z.string()).default([]),
});

export const notificationPreferencesSchema = z.object({
  walletAddress: walletAddressSchema,
  genres: z.array(z.string()),
});

