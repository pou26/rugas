import axios from 'axios';

const API_BASE_URL = import.meta.env.FRONTEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (username, email, password) => api.post('/api/auth/register', { username, email, password }),
};

// Customer API
export const customerAPI = {
  getAll: () => api.get('/api/customers'),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (customer) => api.post('/api/customers', customer),
  update: (id, customer) => api.put(`/api/customers/${id}`, customer),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

// Product API
export const productAPI = {
  getAll: (params = {}) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (product) => {
    const formData = new FormData();
    Object.keys(product).forEach(key => {
      if (key === 'pictures' && product[key]) {
        for (let i = 0; i < product[key].length; i++) {
          formData.append('pictures', product[key][i]);
        }
      } else {
        formData.append(key, product[key]);
      }
    });
    return api.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, product) => api.put(`/api/products/${id}`, product),
  delete: (id) => api.delete(`/api/products/${id}`),
  getCategories: () => api.get('/api/products/categories'),
};

// Order API
export const orderAPI = {
  getAll: (params = {}) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (order) => api.post('/api/orders', order),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/orders/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;