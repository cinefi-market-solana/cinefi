import { z } from "zod";
import { walletAddressSchema } from "./common";

export const upsertUserBodySchema = z.object({
  walletAddress: walletAddressSchema,
});

export const notificationSubscribeBodySchema = z.object({
  walletAddress: walletAddressSchema,
  fcmToken: z.string().min(1, "fcmToken is required"),
  genres: z.array(z.string()).default([]),
});

export const notificationPreferencesBodySchema = z.object({
  walletAddress: walletAddressSchema,
  genres: z.array(z.string()),
});

