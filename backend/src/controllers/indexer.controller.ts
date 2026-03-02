import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { indexerTransactionBodySchema } from "../validators/indexer.validator";
import * as indexerService from "../services/indexer.service";
import type { SuccessResponse } from "../types/api";

export async function handleTransaction(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = indexerTransactionBodySchema.parse(req.body);
  const result = await indexerService.processTransaction(
    body.transactionSignature,
  );
  res.status(StatusCodes.OK).json({
    success: true,
    data: result,
  });
}

