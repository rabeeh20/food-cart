import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  getStats: () => api.get('/admin/stats/dashboard'),
  getUsers: () => api.get('/admin/users')
};

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  uploadImage: (formData) => {
    return api.post('/menu/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const fishAPI = {
  getAllFish: () => api.get('/fish/all'),
  getFishById: (id) => api.get(`/fish/${id}`),
  createFish: (data) => api.post('/fish', data),
  updateFish: (id, data) => api.put(`/fish/${id}`, data),
  deleteFish: (id) => api.delete(`/fish/${id}`),
  getGameSettings: () => api.get('/fish/game-settings'),
  toggleGame: (data) => api.put('/fish/game/toggle', data),
  updatePreparationStyles: (data) => api.put('/fish/game/preparation-styles', data),
  uploadImage: (formData) => {
    return api.post('/menu/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api;
