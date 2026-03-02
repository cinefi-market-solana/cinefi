import { z } from "zod";
import { paginationQuerySchema } from "./common";

export const movieListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["UPCOMING", "BETTING_OPEN", "RESOLVED"]).optional(),
  genre: z.string().optional(),
});

export const adminCreateMovieBodySchema = z.object({
  tmdbId: z.number().int().positive(),
});

