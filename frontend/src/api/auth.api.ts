import { apiClient } from './client';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; referralCode?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    apiClient.post('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),
  logoutAll: () => apiClient.post('/auth/logout-all'),

  refresh: () => apiClient.post('/auth/refresh'),
  me: () => apiClient.get('/auth/me'),

  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => apiClient.post('/auth/verify-email', { token }),

  firebaseLogin: (idToken: string) => apiClient.post('/auth/firebase', { idToken }),
};
