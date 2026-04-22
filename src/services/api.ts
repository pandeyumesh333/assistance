import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    api.post('/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  updatePushToken: (pushToken: string) =>
    api.put('/auth/push-token', { pushToken }),
  updateProfile: (data: { name?: string; notificationsEnabled?: boolean }) =>
    api.put('/auth/profile', data),
};

// Task endpoints
export const taskAPI = {
  getAll: (params?: { completed?: boolean; priority?: string }) =>
    api.get('/tasks', { params }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Meeting endpoints
export const meetingAPI = {
  getAll: (params?: { upcoming?: boolean }) =>
    api.get('/meetings', { params }),
  create: (data: any) => api.post('/meetings', data),
  update: (id: string, data: any) => api.put(`/meetings/${id}`, data),
  delete: (id: string) => api.delete(`/meetings/${id}`),
};

// Transaction endpoints
export const transactionAPI = {
  getAll: (params?: { type?: string; category?: string; limit?: number; page?: number }) =>
    api.get('/transactions', { params }),
  create: (data: any) => api.post('/transactions', data),
  getBalance: () => api.get('/transactions/balance'),
  getDailySummary: () => api.get('/transactions/daily-summary'),
};

// Account endpoints
export const accountAPI = {
  get: () => api.get('/accounts'),
  updateBalance: (amount: number) =>
    api.put('/accounts/opening-balance', { amount }),
};

// Notification endpoints
export const notificationAPI = {
  getAll: (params?: { unread?: boolean }) =>
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
