import { create } from 'zustand';
import {
  UserMeResponseSchema,
  LoginResponseSchema,
  type UserMeResponse,
  type LoginResponse,
} from '@web24/shared';

type AuthState = {
  user: UserMeResponse | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserMeResponse | null) => void;
  fetchMe: () => Promise<UserMeResponse | null>;
  loginGuest: () => Promise<LoginResponse>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 401) {
        set({ user: null, isLoading: false });
        return null;
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = await response.json();
      const user = UserMeResponseSchema.parse(json);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  loginGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = await response.json();
      const loginResponse = LoginResponseSchema.parse(json);
      set({ user: loginResponse, isLoading: false });
      return loginResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      set({ user: null, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
