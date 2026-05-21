import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@api/auth.api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'support' | 'marketing' | 'inventory';
  permissions: string[];
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; referralCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (accessToken) => set({ accessToken }),

      login: async (email, password, rememberMe = false) => {
        const { data } = await authApi.login({ email, password, rememberMe });
        set({ user: data.data.user, accessToken: data.data.tokens.accessToken, isAuthenticated: true });
      },

      register: async (payload) => {
        const { data } = await authApi.register(payload);
        set({ user: data.data.user, accessToken: data.data.tokens.accessToken, isAuthenticated: true });
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        const { accessToken } = get();
        try {
          // If we have a stored token, validate it first
          if (accessToken) {
            const { data } = await authApi.me();
            set({ user: data.data, isAuthenticated: true, isLoading: false });
            return;
          }
          // No stored token — still try refresh cookie (user may have a valid session from another tab)
          throw new Error('no_token');
        } catch {
          // Token expired or missing — attempt silent refresh via httpOnly cookie
          try {
            const { data } = await authApi.refresh();
            set({ accessToken: data.data.tokens.accessToken });
            const { data: meData } = await authApi.me();
            set({ user: meData.data, isAuthenticated: true, isLoading: false });
          } catch {
            // Refresh token also invalid/expired — clear everything, force re-login
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
          }
        }
      },

      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'elva-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
