import type { MovieStatus } from "@prisma/client";
import * as movieRepo from "../repositories/movie.repository";
import type { PaginationParams, PaginatedResult } from "../types/api";
import { AppError } from "../utils/appError";
import { StatusCodes } from "http-status-codes";

function computeSlug(title: string, tmdbId: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${tmdbId}`;
}

export async function getMovies(params: {
  status?: MovieStatus;
  genre?: string;
  pagination: PaginationParams;
}): Promise<PaginatedResult<unknown>> {
  const { status, genre, pagination } = params;
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;

  const [items, total] = await Promise.all([
    movieRepo.listMovies({ status, genre, skip, take }),
    movieRepo.countMovies({ status, genre }),
  ]);

  const result: PaginatedResult<unknown> = {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };

  return result;
}

export async function getMovieById(id: string) {
  const movie = await movieRepo.getMovieById(id);
  if (!movie) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Movie not found",
      "MOVIE_NOT_FOUND",
    );
  }
  return movie;
}

export async function adminCreateMovieFromTmdb(tmdbId: number) {
  // TODO: Integrate with TMDB API to fetch movie details and
  // create or update the corresponding movie record.
  throw new AppError(
    StatusCodes.NOT_IMPLEMENTED,
    `TMDB integration is not implemented yet (tmdbId=${tmdbId})`,
    "TMDB_NOT_IMPLEMENTED",
  );
}
