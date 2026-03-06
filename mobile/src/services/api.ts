import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform, ToastAndroid } from 'react-native';
import { useAuthStore } from '../stores/authStore';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type ApiErrorShape = {
  code: string;
  message: string;
};

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? ''}/api`;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let isRefreshing = false;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();

  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  ToastAndroid.show(fullUrl, ToastAndroid.SHORT);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const originalConfig = error.config as AxiosRequestConfig;

    if (!response || !originalConfig) {
      return Promise.reject(error);
    }

    const status = response.status;
    const url = (originalConfig.url ?? '') as string;
    const isAuthEndpoint = url.startsWith('/auth/');

    if (status === 401 && !isAuthEndpoint) {
      try {
        const { silentRefresh } = useAuthStore.getState();
        await silentRefresh();

        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          originalConfig.headers = {
            ...originalConfig.headers,
            Authorization: `Bearer ${accessToken}`,
          };
          const retryResponse = await api(originalConfig as AxiosRequestConfig);
          return retryResponse;
        }

        return Promise.reject(error);
      } catch (refreshError) {
        const { clearSession } = useAuthStore.getState();
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const normalizeError = (error: unknown): ApiErrorShape => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;

    if (axiosError.response && axiosError.response.data) {
      const data = axiosError.response.data;
      if (!data.success && data.error) {
        return {
          code: data.error.code,
          message: data.error.message,
        };
      }
    }

    const message = axiosError.message || '';
    if (message.toLowerCase().includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: message.toLowerCase(),
      };
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
  };
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw response.data.error;
};

// ---- Auth endpoint request/response types ----

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
};

export type AuthRegisterBody = {
  email: string;
  password?: string;
  name?: string;
};

export type AuthVerifyBody = {
  email: string;
  otp: string;
};

export type AuthLoginBody = {
  email: string;
  password: string;
};

export type AuthRefreshBody = {
  refreshToken: string;
};

export type AuthForgotPasswordBody = {
  email: string;
};

export type AuthResetPasswordBody = {
  email: string;
  otp: string;
  newPassword: string;
};

export type AuthSessionPayload = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
};

export type AuthRefreshPayload = {
  user: SessionUser;
  accessToken: string;
};

export async function authRegister(
  body: AuthRegisterBody,
): Promise<null> {
  try {
    const response = await api.post<ApiEnvelope<null>>('/auth/register', body);
    return unwrap(response);
  } catch (err) {
    ToastAndroid.show(JSON.stringify(err), ToastAndroid.LONG);
    throw normalizeError(err);
  }
}

export async function authVerify(
  body: AuthVerifyBody,
): Promise<AuthSessionPayload> {
  try {
    const response = await api.post<ApiEnvelope<AuthSessionPayload>>(
      '/auth/verify',
      body,
    );
    return unwrap(response);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function authLogin(
  body: AuthLoginBody,
): Promise<AuthSessionPayload> {
  try {
    const response = await api.post<ApiEnvelope<AuthSessionPayload>>(
      '/auth/login',
      body,
    );
    return unwrap(response);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function authRefresh(
  body: AuthRefreshBody,
): Promise<AuthRefreshPayload> {
  try {
    const response = await api.post<ApiEnvelope<AuthRefreshPayload>>(
      '/auth/refresh',
      body,
    );
    return unwrap(response);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function authForgotPassword(
  body: AuthForgotPasswordBody,
): Promise<null> {
  try {
    const response = await api.post<ApiEnvelope<null>>(
      '/auth/forgot-password',
      body,
    );
    return unwrap(response);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function authResetPassword(
  body: AuthResetPasswordBody,
): Promise<null> {
  try {
    const response = await api.post<ApiEnvelope<null>>(
      '/auth/reset-password',
      body,
    );
    return unwrap(response);
  } catch (err) {
    throw normalizeError(err);
  }
}

export { api };

