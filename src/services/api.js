import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're already on login/register
      const isAuthPath = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPath) {
        localStorage.removeItem('hk_token');
        localStorage.removeItem('hk_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
