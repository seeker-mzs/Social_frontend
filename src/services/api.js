import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  timeout: 30000, // ✅ Increased from 10000 to 30000 (30 seconds)
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ API Request with token:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ API Request without token');
    }
    
    config.headers.Accept = 'application/json';
    
    // ✅ CRITICAL FIX: Only set Content-Type for JSON, not for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      console.log('📝 Setting Content-Type: application/json');
    } else {
      // For FormData, let browser set Content-Type automatically with boundary
      delete config.headers['Content-Type'];
      console.log('🖼️ FormData detected - letting browser set Content-Type');
    }
    
    console.log('🚀 Making API request to:', config.url);
    console.log('📦 Request data type:', config.data instanceof FormData ? 'FormData' : 'JSON');
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken'); // ✅ Added this line
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 404) {
      console.log('🔍 404 Not Found - check endpoint URL:', error.config?.url);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timeout - increased to 30 seconds');
    }
    
    if (!error.response) {
      console.log('🌐 Network error - check server connection');
    }
    
    return Promise.reject(error);
  }
);

// Add a test function to verify API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/user');
    console.log('✅ API Connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection test failed:', error);
    return false;
  }
};

export default api;