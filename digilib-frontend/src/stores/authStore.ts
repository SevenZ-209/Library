import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHydrated: () => set({ isHydrated: true }),

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.login({ username, password });
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { detail?: string } } };
          const message =
            error.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng thử lại.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          await get().login(data.username, data.password);
        } catch (err: unknown) {
          const error = err as {
            response?: {
              data?: {
                username?: string[];
                password?: string[];
                detail?: string;
              };
            };
          };
          const message =
            error.response?.data?.username?.[0] ||
            error.response?.data?.password?.[0] ||
            error.response?.data?.detail ||
            'Đăng ký thất bại. Vui lòng thử lại.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
      },

      checkAuth: async () => {
        if (!get().isHydrated) return;
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true, token });
          } catch {
            authService.logout();
            set({ user: null, isAuthenticated: false, token: null });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'digilib-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
