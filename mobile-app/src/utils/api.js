import axios from 'axios';
import { API_URL } from './constants';
import { getToken } from './storage';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    console.log(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);

    if (error.response?.status === 401) {
      // Token expired or invalid - handled by AuthContext
      console.log('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  requestOTP: (email) => api.post('/auth/request-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getProfile: () => api.get('/auth/profile'),
};

// Menu APIs
export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  getByCategory: (category) => api.get(`/menu/category/${category}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

// Address APIs
export const addressAPI = {
  getAll: () => api.get('/address'),
  create: (addressData) => api.post('/address', addressData),
  update: (id, addressData) => api.put(`/address/${id}`, addressData),
  delete: (id) => api.delete(`/address/${id}`),
  setDefault: (id) => api.put(`/address/${id}/set-default`),
};

// Fish APIs
export const fishAPI = {
  getAvailable: () => api.get('/fish/available'),
  getPreparationStyles: () => api.get('/fish/preparation-styles'),
  getGameSettings: () => api.get('/fish/game-settings'),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (amount, orderId) => api.post('/payment/create-order', { amount, orderId }),
  verifyPayment: (paymentData) => api.post('/payment/verify-payment', paymentData),
};

export default api;
