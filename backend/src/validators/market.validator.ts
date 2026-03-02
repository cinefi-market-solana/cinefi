import { z } from "zod";
import { paginationQuerySchema, walletAddressSchema } from "./common";

export const marketListQuerySchema = paginationQuerySchema;

export const createBetBodySchema = z.object({
  walletAddress: walletAddressSchema,
  transactionSignature: z.string().min(1),
  predictedScore: z.number().min(0).max(100),
  stakeAmount: z.number().positive(),
});

export const resolveMarketBodySchema = z.object({
  finalScore: z.number().min(0).max(100),
});

export const adminCreateMarketBodySchema = z.object({
  movieId: z.string().min(1),
  programAddress: z.string().min(1),
  switchboardFeedPubkey: z.string().min(1),
});

