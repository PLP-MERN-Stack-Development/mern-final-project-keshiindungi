import axios from 'axios';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add request interceptor to log all API calls
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Making API call: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    return Promise.reject(error);
  }
);

export default api;