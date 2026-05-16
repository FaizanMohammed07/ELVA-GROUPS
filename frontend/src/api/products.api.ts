import { apiClient } from './client';

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isPersonalizable?: boolean;
  collections?: string;
}

export const productsApi = {
  list: (params?: ProductQuery) => apiClient.get('/products', { params }),
  getBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
  getById: (id: string) => apiClient.get(`/products/id/${id}`),
  getFeatured: () => apiClient.get('/products/featured'),
  getNewArrivals: () => apiClient.get('/products/new-arrivals'),
  getBestSellers: () => apiClient.get('/products/best-sellers'),
  search: (q: string) => apiClient.get('/search', { params: { q } }),
  getRelated: (id: string) => apiClient.get(`/products/${id}/related`),
  getSuggestions: (q: string) => apiClient.get('/search/suggestions', { params: { q } }),
};

export const categoriesApi = {
  list: () => apiClient.get('/categories'),
  getFeatured: () => apiClient.get('/categories/featured'),
  getTree: () => apiClient.get('/categories/tree'),
  getBySlug: (slug: string) => apiClient.get(`/categories/${slug}`),
  getProducts: (id: string, params?: ProductQuery) => apiClient.get(`/categories/${id}/products`, { params }),
};
