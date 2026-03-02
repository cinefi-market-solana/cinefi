import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { movieListQuerySchema } from "../validators/movie.validator";
import * as movieService from "../services/movie.service";
import * as adminController from "./admin.controller";
import type { PaginatedResponse, SuccessResponse } from "../types/api";
import type { Movie } from "@prisma/client";
import { getParam } from "../utils/params";

export async function getMovies(req: Request, res: Response<PaginatedResponse<Movie>>): Promise<void> {
  const parsedQuery = movieListQuerySchema.parse(req.query);

  const result = await movieService.getMovies({
    status: parsedQuery.status,
    genre: parsedQuery.genre,
    pagination: {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items as Movie[],
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
}

export async function getMovieById(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const movie = await movieService.getMovieById(getParam(req, "id"));
  res.status(StatusCodes.OK).json({
    success: true,
    data: movie,
  });
}

/** Admin: create movie. */
export async function createMovie(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  return adminController.createMovie(req, res);
}

/** Admin: edit movie. Not implemented. */
export async function updateMovie(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Edit movie is not implemented yet",
  });
}

/** Admin: delete movie. Not implemented. */
export async function deleteMovie(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Delete movie is not implemented yet",
  });
}

