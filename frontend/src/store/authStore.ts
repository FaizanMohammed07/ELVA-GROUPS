import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@api/auth.api';
import { signInWithGoogle, firebaseSignOut } from '@/lib/firebase';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';

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
  loginWithGoogle: () => Promise<{ isNew: boolean }>;
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

      loginWithGoogle: async () => {
        const idToken = await signInWithGoogle();
        const { data } = await authApi.firebaseLogin(idToken);
        set({ user: data.data.user, accessToken: data.data.tokens.accessToken, isAuthenticated: true });
        return { isNew: data.data.isNew };
      },

      register: async (payload) => {
        const { data } = await authApi.register(payload);
        set({ user: data.data.user, accessToken: data.data.tokens.accessToken, isAuthenticated: true });
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        try { await firebaseSignOut(); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clear();
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        const { accessToken } = get();
        try {
          if (accessToken) {
            const { data } = await authApi.me();
            set({ user: data.data, isAuthenticated: true });
            return;
          }
          throw new Error('no_token');
        } catch {
          try {
            const { data } = await authApi.refresh();
            set({ accessToken: data.data.tokens.accessToken });
            const { data: meData } = await authApi.me();
            set({ user: meData.data, isAuthenticated: true });
          } catch {
            set({ user: null, accessToken: null, isAuthenticated: false });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'elva-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
