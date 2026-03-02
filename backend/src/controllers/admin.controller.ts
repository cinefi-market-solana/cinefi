import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  adminCreateMovieBodySchema,
} from "../validators/movie.validator";
import {
  adminCreateMarketBodySchema,
  resolveMarketBodySchema,
} from "../validators/market.validator";
import * as movieService from "../services/movie.service";
import * as marketService from "../services/market.service";
import type { SuccessResponse } from "../types/api";

export async function createMovie(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = adminCreateMovieBodySchema.parse(req.body);
  const movie = await movieService.adminCreateMovieFromTmdb(body.tmdbId);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: movie,
  });
}

export async function createMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = adminCreateMarketBodySchema.parse(req.body);
  const market = await marketService.adminCreateMarket(body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: market,
  });
}

export async function resolveMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = resolveMarketBodySchema.parse(req.body);
  const result = await marketService.adminResolveMarket({
    marketId: req.params.id,
    finalScore: body.finalScore,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

export async function closeMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const result = await marketService.adminCloseMarket(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

export async function deleteMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const result = await marketService.adminDeleteMarket(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

