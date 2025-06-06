import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API functions
export const lookbookAPI = {
  // Get all looks
  getAllLooks: () => api.get(`/looks?t=${Date.now()}`),
  
  // Get look by ID
  getLookById: (id) => api.get(`/looks/${id}?t=${Date.now()}`),
  
  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}?t=${Date.now()}`),
};

export const productAPI = {
  // Get product by ID
  getProduct: (id) => api.get(`/products/${id}?t=${Date.now()}`),
  
  // Get all products
  getAllProducts: () => api.get(`/products?t=${Date.now()}`),
};

export default api; 