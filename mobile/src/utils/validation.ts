import { z } from 'zod';

export const OTP_LENGTH = 6;

export const emailSchema = z
  .string()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')
  .transform((s) => s.trim());

export const nameSchema = z
  .string()
  .min(1, 'Name is required.')
  .transform((s) => s.trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.');

export const otpSchema = z
  .string()
  .min(1, 'Verification code is required.')
  .length(OTP_LENGTH, `Enter a ${OTP_LENGTH}-digit verification code.`)
  .regex(/^\d+$/, `Enter a ${OTP_LENGTH}-digit verification code.`);

const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required.');

export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordFormSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

/**
 * Parse with schema and return first error message for form display.
 */
export function parseWithMessage<T>(
  schema: z.ZodType<T>,
  value: unknown,
): ParseResult<T> {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstMessage =
    result.error?.issues?.[0]?.message ?? 'Invalid value.';
  return { success: false, message: firstMessage };
}
