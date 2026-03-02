import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required"),
  ADMIN_SECRET: z.string().min(1, "ADMIN_SECRET is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a number")
    .transform((val) => Number(val)),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  LOG_PRETTY: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ?? "3000",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  LOG_PRETTY: process.env.LOG_PRETTY,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const formatted = parsed.error.flatten();
  const message = `Invalid environment configuration: ${JSON.stringify(
    formatted,
  )}`;
  throw new Error(message);
}

export const env = parsed.data;

export type Env = typeof env;

export const allowedOrigins: string[] = env.ALLOWED_ORIGINS.split(",").map(
  (origin) => origin.trim(),
);