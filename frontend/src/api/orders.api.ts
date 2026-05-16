import { apiClient } from './client';

export const ordersApi = {
  create: (data: any) => apiClient.post('/orders', data),
  getMy: (params?: { page?: number; limit?: number }) => apiClient.get('/orders/my', { params }),
  myOrders: (params?: { page?: number; limit?: number }) => apiClient.get('/orders/my', { params }),
  getMyOrder: (id: string) => apiClient.get(`/orders/my/${id}`),
  getById: (id: string) => apiClient.get(`/orders/my/${id}`),
  getByOrderNumber: (orderNumber: string) => apiClient.get(`/orders/my/number/${orderNumber}`),
  cancel: (id: string, reason?: string) => apiClient.post(`/orders/my/${id}/cancel`, { reason: reason || 'Customer requested' }),
  requestReturn: (id: string, reason: string) => apiClient.post(`/orders/my/${id}/return`, { reason }),
  // Admin
  list: (params?: any) => apiClient.get('/orders', { params }),
  updateStatus: (id: string, status: string, data?: any) => apiClient.patch(`/orders/${id}/status`, { status, ...data }),
};

export const paymentsApi = {
  createRazorpayOrder: (orderId: string) => apiClient.post('/payments/create-order', { orderId }),
  verify: (data: { orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiClient.post('/payments/verify', data),
};

export const cartApi = {
  get: () => apiClient.get('/cart'),
  addItem: (data: { productId: string; variantId?: string; quantity: number; personalization?: Record<string, string> }) =>
    apiClient.post('/cart/items', data),
  updateItem: (productId: string, data: { quantity: number; variantId?: string }) =>
    apiClient.put(`/cart/items/${productId}`, data),
  removeItem: (productId: string, variantId?: string) =>
    apiClient.delete(`/cart/items/${productId}`, { params: { variantId } }),
  clear: () => apiClient.delete('/cart'),
};

export const couponsApi = {
  validate: (code: string, orderValue: number) => apiClient.post('/coupons/validate', { code, orderValue }),
};

export const shippingApi = {
  estimate: (orderValue: number) => apiClient.post('/shipping/estimate', { orderValue }),
  checkServiceability: (pincode: string) => apiClient.post('/shipping/check-serviceability', { pincode }),
};
