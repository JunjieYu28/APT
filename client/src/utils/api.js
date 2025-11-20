import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  googleAuth: (data) => api.post('/api/auth/google', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  uploadAvatar: (formData) => api.post('/api/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Canvas API
export const canvasAPI = {
  getAll: () => api.get('/api/canvas'),
  getById: (id) => api.get(`/api/canvas/${id}`),
  create: (data) => api.post('/api/canvas', data),
  update: (id, data) => api.put(`/api/canvas/${id}`, data),
  delete: (id) => api.delete(`/api/canvas/${id}`)
};

export default api;
