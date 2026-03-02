import type { MovieStatus } from "@prisma/client";
import prisma from "../lib/prisma";

export async function listMovies(params: {
  status?: MovieStatus;
  genre?: string;
  skip: number;
  take: number;
}) {
  const { status, genre, skip, take } = params;

  return prisma.movie.findMany({
    where: {
      ...(status && { status }),
      ...(genre && { genres: { has: genre } }),
    },
    include: {
      market: true,
    },
    orderBy: { releaseDate: "asc" },
    skip,
    take,
  });
}

export async function countMovies(params: {
  status?: MovieStatus;
  genre?: string;
}) {
  const { status, genre } = params;

  return prisma.movie.count({
    where: {
      ...(status && { status }),
      ...(genre && { genres: { has: genre } }),
    },
  });
}

export async function getMovieById(id: string) {
  return prisma.movie.findUnique({
    where: { id },
    include: { market: true },
  });
}

export async function getMovieByTmdbId(tmdbId: number) {
  return prisma.movie.findUnique({
    where: { tmdbId },
  });
}

export async function upsertMovieFromTmdb(data: {
  tmdbId: number;
  title: string;
  slug: string;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  releaseDate?: Date | null;
  genres: string[];
}) {
  const { tmdbId, title, slug, posterUrl, trailerUrl, releaseDate, genres } = data;

  return prisma.movie.upsert({
    where: { tmdbId },
    create: {
      tmdbId,
      title,
      slug,
      posterUrl: posterUrl ?? undefined,
      trailerUrl: trailerUrl ?? undefined,
      releaseDate: releaseDate ?? undefined,
      genres,
    },
    update: {
      title,
      slug,
      posterUrl: posterUrl ?? undefined,
      trailerUrl: trailerUrl ?? undefined,
      releaseDate: releaseDate ?? undefined,
      genres,
    },
  });
}

export async function updateMovieTrailerIfMissing(movieId: string, trailerUrl: string) {
  return prisma.movie.update({
    where: { id: movieId },
    data: { trailerUrl },
  });
}

