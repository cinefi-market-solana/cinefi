import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import type { AuthRefreshPayload } from '../services/api';

const REFRESH_TOKEN_KEY = 'refresh_token';
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/api`;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
};

type AuthState = {
  accessToken: string | null;
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthActions = {
  setSession: (
    user: SessionUser,
    accessToken: string,
    refreshToken?: string,
  ) => Promise<void>;
  clearSession: () => Promise<void>;
  silentRefresh: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

type RefreshEnvelope = {
  success: boolean;
  data?: AuthRefreshPayload;
  error?: {
    code: string;
    message: string;
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setSession: async (user, accessToken, refreshToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    if (refreshToken !== undefined) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearSession: async () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  silentRefresh: async () => {
    const { clearSession, setSession } = get();

    set({ isLoading: true });

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        await clearSession();
        return;
      }

      const response = await axios.post<RefreshEnvelope>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      if (!response.data.success || !response.data.data) {
        await clearSession();
        return;
      }

      const { user, accessToken } = response.data.data;
      await setSession(user, accessToken);
    } catch {
      await clearSession();
    } finally {
      set({ isLoading: false });
    }
  },
}));

