import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  marketListQuerySchema,
  createBetBodySchema,
} from "../validators/market.validator";
import * as marketService from "../services/market.service";
import * as adminController from "./admin.controller";
import type { PaginatedResponse, SuccessResponse } from "../types/api";
import { getParam } from "../utils/params";

export async function getMarkets(
  req: Request,
  res: Response<PaginatedResponse<unknown>>,
): Promise<void> {
  const parsed = marketListQuerySchema.parse(req.query);
  const result = await marketService.listMarkets({
    page: parsed.page,
    limit: parsed.limit,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
}

export async function getMarketById(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const market = await marketService.getMarketById(getParam(req, "id"));
  res.status(StatusCodes.OK).json({
    success: true,
    data: market,
  });
}

export async function getMarketDistribution(
  req: Request,
  res: Response<SuccessResponse<Array<{ bucket: number; count: number }>>>,
): Promise<void> {
  const distribution = await marketService.getMarketDistribution(getParam(req, "id"));
  res.status(StatusCodes.OK).json({
    success: true,
    data: distribution,
  });
}

export async function createBet(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = createBetBodySchema.parse(req.body);
  const bet = await marketService.createBetForMarket({
    marketId: getParam(req, "id"),
    walletAddress: body.walletAddress,
    transactionSignature: body.transactionSignature,
    predictedScore: body.predictedScore,
    stakeAmount: body.stakeAmount,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: bet,
  });
}

export async function getMarketBets(
  req: Request,
  res: Response<PaginatedResponse<unknown>>,
): Promise<void> {
  const parsed = marketListQuerySchema.parse(req.query);
  const result = await marketService.listBetsForMarket({
    marketId: getParam(req, "id"),
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: result.items,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
  });
}

/** Admin: create market. */
export async function createMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  return adminController.createMarket(req, res);
}

/** Admin: resolve market. */
export async function resolveMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  return adminController.resolveMarket(req, res);
}

/** Admin: close market. */
export async function closeMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const result = await marketService.adminCloseMarket(getParam(req, "id"));
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

/** Admin: delete market. */
export async function deleteMarket(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const result = await marketService.adminDeleteMarket(getParam(req, "id"));
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

/** Admin: edit market. Not implemented. */
export async function updateMarket(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Edit market is not implemented yet",
  });
}

