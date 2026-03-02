import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  notificationPreferencesSchema,
  notificationSubscribeSchema,
} from "../validators/notification.validator";
import * as notificationService from "../services/notification.service";
import type { SuccessResponse } from "../types/api";

export async function subscribe(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = notificationSubscribeSchema.parse(req.body);
  const user = await notificationService.subscribeUser(body);
  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
}

export async function updatePreferences(
  req: Request,
  res: Response<SuccessResponse<unknown>>,
): Promise<void> {
  const body = notificationPreferencesSchema.parse(req.body);
  const user = await notificationService.updatePreferences(body);
  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
}

/** Admin: trigger notifications. Not implemented. */
export async function send(
  _req: Request,
  res: Response,
): Promise<void> {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    error: "Not Implemented",
    message: "Send notifications is not implemented yet",
  });
}

