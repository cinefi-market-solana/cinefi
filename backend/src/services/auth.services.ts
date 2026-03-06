import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { env } from "../config/env";
import * as userRepo from "../repositories/user.repository";
import * as otpRepo from "../repositories/otp.repository";
import { AppError } from "../utils/appError";
import { StatusCodes } from "http-status-codes";
import type {
    RegisterInput,
    LoginInput,
    VerifyOtpInput,
    ForgotPasswordInput,
    ResendOtpInput,
    ResetPasswordInput,
} from "../validators/auth.validator";
import { generateOtp, hashOtp, sendEmail } from "../utils/otp";

const SALT_ROUNDS = 10;

export type SessionUser = {
    id: string;
    email: string;
    name: string | null;
    role: User["role"];
};

export async function register(input: RegisterInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await userRepo.getUserByEmail(normalizedEmail);

    if (existing && existing.isVerified) {
        throw new AppError(
            StatusCodes.CONFLICT,
            "Email already registered",
            "EMAIL_ALREADY_EXISTS",
        );
    }

    const recentOtps = await otpRepo.countRecentOtps(normalizedEmail);
    if (recentOtps >= 5) {
        throw new AppError(
            StatusCodes.TOO_MANY_REQUESTS,
            "Too many OTP requests",
            "TOO_MANY_OTP_REQUESTS",
        );
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    await userRepo.createOrUpdateUser({
        email: normalizedEmail,
        name: input.name ?? null,
        password: passwordHash,
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await otpRepo.createOtp(normalizedEmail, otpHash);
    await sendEmail(normalizedEmail, otp);
}

export async function resendOtp(input: ResendOtpInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const recentOtps = await otpRepo.countRecentOtps(normalizedEmail);
    if (recentOtps >= 5) {
        throw new AppError(
            StatusCodes.TOO_MANY_REQUESTS,
            "Too many OTP requests",
            "TOO_MANY_OTP_REQUESTS",
        );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await otpRepo.createOtp(normalizedEmail, otpHash);
    await sendEmail(normalizedEmail, otp);
}

export async function login(input: LoginInput): Promise<{
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
}> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await userRepo.getUserByEmail(normalizedEmail);
    if (!user || !user.password || !user.isVerified) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid email or password",
            "INVALID_CREDENTIALS",
        );
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid email or password",
            "INVALID_CREDENTIALS",
        );
    }

    const sessionUser = toSessionUser(user);
    const accessToken = signAccessToken(sessionUser);
    const refreshToken = signRefreshToken(sessionUser);

    return { user: sessionUser, accessToken, refreshToken };
}

export async function refreshAccessToken(
    refreshToken: string | undefined,
): Promise<{
    user: SessionUser;
    accessToken: string;
}> {
    if (!refreshToken) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Refresh token required",
            "REFRESH_TOKEN_MISSING",
        );
    }

    let payload: JwtPayload;
    try {
        payload = jwt.verify(
            refreshToken,
            env.REFRESH_TOKEN_SECRET,
        ) as JwtPayload;
    } catch {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid or expired refresh token",
            "INVALID_TOKEN",
        );
    }

    if (payload.type !== "refresh" || !payload.sub) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid refresh token",
            "INVALID_TOKEN",
        );
    }

    const userId =
        typeof payload.sub === "string" ? payload.sub : String(payload.sub);
    const user = await userRepo.getUserById(userId);
    if (!user) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "User not found",
            "USER_NOT_FOUND",
        );
    }

    const sessionUser = toSessionUser(user);
    const accessToken = signAccessToken(sessionUser);

    return { user: sessionUser, accessToken };
}

export async function verifyEmailOtp(
    input: VerifyOtpInput,
): Promise<{
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
}> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const otpHash = hashOtp(input.otp);

    const isValid = await otpRepo.verifyOtp(normalizedEmail, otpHash);
    if (!isValid) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid or expired OTP",
            "INVALID_OTP",
        );
    }

    const user = await userRepo.getUserByEmail(normalizedEmail);
    if (!user) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "User not found",
            "USER_NOT_FOUND",
        );
    }

    const verifiedUser = user.isVerified
        ? user
        : await userRepo.markUserVerified(user.id);

    const sessionUser = toSessionUser(verifiedUser);
    const accessToken = signAccessToken(sessionUser);
    const refreshToken = signRefreshToken(sessionUser);

    return { user: sessionUser, accessToken, refreshToken };
}

export async function requestPasswordReset(
    input: ForgotPasswordInput,
): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await userRepo.getUserByEmail(normalizedEmail);

    if (!user) {
        return;
    }

    const recentOtps = await otpRepo.countRecentOtps(normalizedEmail);
    if (recentOtps >= 5) {
        throw new AppError(
            StatusCodes.TOO_MANY_REQUESTS,
            "Too many OTP requests",
            "TOO_MANY_OTP_REQUESTS",
        );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await otpRepo.createOtp(normalizedEmail, otpHash);
    await sendEmail(normalizedEmail, otp);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const otpHash = hashOtp(input.otp);

    const isValid = await otpRepo.verifyOtp(normalizedEmail, otpHash);
    if (!isValid) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid or expired OTP",
            "INVALID_OTP",
        );
    }

    const user = await userRepo.getUserByEmail(normalizedEmail);
    if (!user) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "User not found",
            "USER_NOT_FOUND",
        );
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await userRepo.updateUserPassword(user.id, passwordHash);
}

function signAccessToken(user: SessionUser): string {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: "access",
        },
        env.JWT_SECRET,
        { expiresIn: "30m" },
    );
}

function signRefreshToken(user: SessionUser): string {
    return jwt.sign(
        {
            sub: user.id,
            type: "refresh",
        },
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
    );
}

function toSessionUser(user: User): SessionUser {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}