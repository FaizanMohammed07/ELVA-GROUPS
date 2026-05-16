import { apiClient } from './client';

export const userApi = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data: any) => apiClient.put('/users/me', data),
  getAddresses: () => apiClient.get('/users/me/addresses'),
  addAddress: (data: any) => apiClient.post('/users/me/addresses', data),
  updateAddress: (id: string, data: any) => apiClient.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => apiClient.delete(`/users/me/addresses/${id}`),
  updatePreferences: (data: any) => apiClient.put('/users/me/preferences', data),
};

export const wishlistApi = {
  get: () => apiClient.get('/wishlist'),
  add: (productId: string) => apiClient.post(`/wishlist/${productId}`),
  remove: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
  check: (productId: string) => apiClient.get(`/wishlist/check/${productId}`),
};

export const loyaltyApi = {
  get: () => apiClient.get('/loyalty'),
  getHistory: (page?: number) => apiClient.get('/loyalty/history', { params: { page } }),
  getTiers: () => apiClient.get('/loyalty/tiers'),
};

export const referralApi = {
  getMyCode: () => apiClient.get('/referrals/my-code'),
  getMyReferrals: () => apiClient.get('/referrals/my-referrals'),
};

export const reviewsApi = {
  getProductReviews: (productId: string, page?: number) => apiClient.get(`/reviews/product/${productId}`, { params: { page } }),
  getReviewSummary: (productId: string) => apiClient.get(`/reviews/product/${productId}/summary`),
  create: (data: any) => apiClient.post('/reviews', data),
  update: (id: string, data: any) => apiClient.put(`/reviews/${id}`, data),
  delete: (id: string) => apiClient.delete(`/reviews/${id}`),
  markHelpful: (id: string) => apiClient.post(`/reviews/${id}/helpful`),
};
