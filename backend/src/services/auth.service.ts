import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { env } from "../config/env";
import * as userRepo from "../repositories/user.repository";
import { AppError } from "../utils/appError";
import { StatusCodes } from "http-status-codes";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 10;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: User["role"];
};

export async function register(input: RegisterInput): Promise<void> {
  const existing = await userRepo.getUserByEmail(input.email);
  if (existing) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Email already registered",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  await userRepo.createUser({
    email: input.email,
    name: input.name ?? null,
    password: passwordHash,
  });
}

export async function login(input: LoginInput): Promise<{
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}> {
  const user = await userRepo.getUserByEmail(input.email);
  if (!user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid email or password",
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.password) {
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

export async function refreshAccessToken(refreshToken: string | undefined): Promise<{
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
    payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as JwtPayload;
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

  const userId = typeof payload.sub === "string" ? payload.sub : String(payload.sub);
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
