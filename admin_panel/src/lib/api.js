import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor to attach the auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const getImageUrl = (url) => {
  if (!url) return null;
  // Handle legacy api.fameu.in or /uploads/ paths
  if (url.includes('/uploads/')) {
    const path = url.substring(url.indexOf('/uploads/') + '/uploads/'.length);
    return `https://fameu.online/cdn/${path}`;
  }
  if (url.includes('/cdn/')) {
    const path = url.substring(url.indexOf('/cdn/') + '/cdn/'.length);
    return `https://fameu.online/cdn/${path}`;
  }
  return url;
};
