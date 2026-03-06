import { useMutation } from '@tanstack/react-query';
import type { ApiErrorShape } from '@/services/api';
import {
  authRegister,
  authLogin,
  authVerify,
  authForgotPassword,
  authResendOtp,
  authResetPassword,
  type AuthRegisterBody,
  type AuthLoginBody,
  type AuthVerifyBody,
  type AuthForgotPasswordBody,
  type AuthResendOtpBody,
  type AuthResetPasswordBody,
} from '@/services/api';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (body: AuthRegisterBody) => authRegister(body),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (body: AuthLoginBody) => authLogin(body),
  });
}

export function useVerifyMutation() {
  return useMutation({
    mutationFn: (body: AuthVerifyBody) => authVerify(body),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (body: AuthForgotPasswordBody) => authForgotPassword(body),
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (body: AuthResendOtpBody) => authResendOtp(body),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (body: AuthResetPasswordBody) => authResetPassword(body),
  });
}

export function isApiError(error: unknown): error is ApiErrorShape {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in (error as ApiErrorShape)
  );
}

export function getApiError(error: unknown): ApiErrorShape | null {
  if (isApiError(error)) return error;
  return null;
}
