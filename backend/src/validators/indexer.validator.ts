import { z } from "zod";

export const indexerTransactionBodySchema = z.object({
  transactionSignature: z.string().min(1),
});

