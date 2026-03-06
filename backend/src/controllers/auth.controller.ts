import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    registerBodySchema,
    loginBodySchema,
    refreshBodySchema,
    verifyOtpBodySchema,
    forgotPasswordBodySchema,
    resendOtpBodySchema,
    resetPasswordBodySchema,
} from "../validators/auth.validator";
import * as authService from "../services/auth.services";
import type { SuccessResponse } from "../types/api";

export async function register(
    req: Request,
    res: Response<SuccessResponse<{ message: string }>>,
): Promise<void> {
    const body = registerBodySchema.parse(req.body);
    await authService.register(body);
    res.status(StatusCodes.CREATED).json({
        success: true,
        data: { message: "Registration successful. Please check your email for the verification code." },
    });
}

export async function login(
    req: Request,
    res: Response<
        SuccessResponse<{
            user: authService.SessionUser;
            accessToken: string;
            refreshToken: string;
        }>
    >,
): Promise<void> {
    const body = loginBodySchema.parse(req.body);
    const result = await authService.login(body);
    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
}

export async function refresh(
    req: Request,
    res: Response<
        SuccessResponse<{ user: authService.SessionUser; accessToken: string }>
    >,
): Promise<void> {
    const body = refreshBodySchema.parse(req.body);
    const result = await authService.refreshAccessToken(body.refreshToken);
    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
}

export async function verifyUser(
    req: Request,
    res: Response<
        SuccessResponse<{
            user: authService.SessionUser;
            accessToken: string;
            refreshToken: string;
        }>
    >,
): Promise<void> {
    const body = verifyOtpBodySchema.parse(req.body);
    const result = await authService.verifyEmailOtp(body);
    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
}

export async function forgotPassword(
    req: Request,
    res: Response<SuccessResponse<{ message: string }>>,
): Promise<void> {
    const body = forgotPasswordBodySchema.parse(req.body);
    await authService.requestPasswordReset(body);
    res.status(StatusCodes.OK).json({
        success: true,
        data: { message: "OTP sent to email" },
    });
}

export async function resendOtp(
    req: Request,
    res: Response<SuccessResponse<{ message: string }>>,
): Promise<void> {
    const body = resendOtpBodySchema.parse(req.body);
    await authService.resendOtp(body);
    res.status(StatusCodes.OK).json({
        success: true,
        data: { message: "OTP sent to email" },
    });
}

export async function resetPassword(
    req: Request,
    res: Response<SuccessResponse<{ message: string }>>,
): Promise<void> {
    const body = resetPasswordBodySchema.parse(req.body);
    await authService.resetPassword(body);
    res.status(StatusCodes.OK).json({
        success: true,
        data: { message: "Password reset successfully" },
    });
}

