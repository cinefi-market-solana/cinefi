import { z } from "zod";

const emailSchema = z.string().email("Invalid email");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerBodySchema = z.object({
  email: emailSchema,
  name: z.string().min(1, "Name is required").optional(),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshInput = z.infer<typeof refreshBodySchema>;
