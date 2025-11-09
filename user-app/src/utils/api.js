import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Menu APIs
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories/list')
};

// Address APIs
export const addressAPI = {
  getAll: () => api.get('/address'),
  create: (data) => api.post('/address', data),
  update: (id, data) => api.put(`/address/${id}`, data),
  delete: (id) => api.delete(`/address/${id}`),
  setDefault: (id) => api.patch(`/address/${id}/set-default`)
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`)
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data)
};

// Fish APIs
export const fishAPI = {
  getAvailable: () => api.get('/fish/available'),
  getPreparationStyles: () => api.get('/fish/preparation-styles'),
  getGameSettings: () => api.get('/fish/game-settings')
};

export default api;
