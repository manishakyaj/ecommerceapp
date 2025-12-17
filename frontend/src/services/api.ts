import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  getProducts: (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
  }) => api.get('/products', { params }),
  
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  getCategories: () => api.get('/categories'),
};

// Helper to attach admin secret header when present in localStorage
function adminHeaders() {
  const secret = localStorage.getItem('ADMIN_SECRET');
  return secret ? { headers: { 'X-ADMIN-SECRET': secret } } : {};
}

export const adminService = {
  createCategory: (name: string, description?: string) =>
    api.post('/categories', { name, description }, adminHeaders()),
  updateCategory: (id: number, data: any) =>
    api.patch(`/categories/${id}`, data, adminHeaders()),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`, adminHeaders()),
  createProduct: (payload: any) => api.post('/products', payload, adminHeaders()),
  updateProduct: (id: number, data: any) =>
    api.patch(`/products/${id}`, data, adminHeaders()),
  deleteProduct: (id: number) => api.delete(`/products/${id}`, adminHeaders()),
  getOrders: () => api.get('/orders', adminHeaders()),
  getSales: () => api.get('/sales', adminHeaders()),
};

// admin update/delete
adminService.updateCategory = (id: number, data: any) =>
  api.patch(`/categories/${id}`, data, adminHeaders());
adminService.deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`, adminHeaders());
adminService.updateProduct = (id: number, data: any) =>
  api.patch(`/products/${id}`, data, adminHeaders());
adminService.deleteProduct = (id: number) =>
  api.delete(`/products/${id}`, adminHeaders());

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (productId: number, quantity: number = 1) =>
    api.post('/cart', { product_id: productId, quantity }),
  
  removeFromCart: (itemId: number) => api.delete(`/cart/${itemId}`),
};

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
};

export default api;
