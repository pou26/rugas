// api.js - Fixed version with proper error handling and debugging
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.NODE_ENV
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Authorization header added');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - check your network connection');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if the backend server is running');
    } else if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing token and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post('/api/auth/login', { email, password });
      console.log('✅ Login successful');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },
  
  register: async (username, email, password) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await api.post('/api/auth/register', { username, email, password });
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },
};

// Customer API
export const customerAPI = {
  getAll: async () => {
    try {
      console.log('👥 Fetching all customers...');
      const response = await api.get('/api/customers');
      console.log('✅ Customers fetched successfully:', response.data?.length || 0, 'customers');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch customers:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      console.log(`👤 Fetching customer ${id}...`);
      const response = await api.get(`/api/customers/${id}`);
      console.log('✅ Customer fetched successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch customer ${id}:`, error);
      throw error;
    }
  },
  
  create: async (customer) => {
    try {
      console.log('➕ Creating new customer...');
      const response = await api.post('/api/customers', customer);
      console.log('✅ Customer created successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      throw error;
    }
  },
  
  update: async (id, customer) => {
    try {
      console.log(`✏️ Updating customer ${id}...`);
      const response = await api.put(`/api/customers/${id}`, customer);
      console.log('✅ Customer updated successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to update customer ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting customer ${id}...`);
      const response = await api.delete(`/api/customers/${id}`);
      console.log('✅ Customer deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to delete customer ${id}:`, error);
      throw error;
    }
  },
};

// Product API
export const productAPI = {
  getAll: async (params = {}) => {
    try {
      console.log('🛍️ Fetching all products...');
      const response = await api.get('/api/products', { params });
      console.log('✅ Products fetched successfully:', response.data?.data?.length || 0, 'products');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      console.log(`🛍️ Fetching product ${id}...`);
      const response = await api.get(`/api/products/${id}`);
      console.log('✅ Product fetched successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch product ${id}:`, error);
      throw error;
    }
  },
  
  create: async (product) => {
    try {
      console.log('➕ Creating new product...');
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
      
      const response = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Product created successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  },
  
  update: async (id, product) => {
    try {
      console.log(`✏️ Updating product ${id}...`);
      const response = await api.put(`/api/products/${id}`, product);
      console.log('✅ Product updated successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to update product ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting product ${id}...`);
      const response = await api.delete(`/api/products/${id}`);
      console.log('✅ Product deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to delete product ${id}:`, error);
      throw error;
    }
  },
  
  getCategories: async () => {
    try {
      console.log('🏷️ Fetching categories...');
      const response = await api.get('/api/products/categories');
      console.log('✅ Categories fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw error;
    }
  },
};

// Order API
export const orderAPI = {
  getAll: async (params = {}) => {
    try {
      console.log('📋 Fetching all orders...');
      const response = await api.get('/api/orders', { params });
      console.log('✅ Orders fetched successfully:', response.data?.length || 0, 'orders');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      console.log(`📋 Fetching order ${id}...`);
      const response = await api.get(`/api/orders/${id}`);
      console.log('✅ Order fetched successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch order ${id}:`, error);
      throw error;
    }
  },
  
  create: async (order) => {
    try {
      console.log('➕ Creating new order...');
      const response = await api.post('/api/orders', order);
      console.log('✅ Order created successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      console.log(`✏️ Updating order ${id} status to ${status}...`);
      const response = await api.put(`/api/orders/${id}/status`, { status });
      console.log('✅ Order status updated successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to update order ${id} status:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting order ${id}...`);
      const response = await api.delete(`/api/orders/${id}`);
      console.log('✅ Order deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Failed to delete order ${id}:`, error);
      throw error;
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await api.get('/api/dashboard/stats');
      console.log('✅ Dashboard stats fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
      throw error;
    }
  },
};

// Health check function
export const healthCheck = async () => {
  try {
    console.log('🏥 Performing health check...');
    const response = await api.get('/api/health');
    console.log('✅ Health check passed');
    return response;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
};

export default api;