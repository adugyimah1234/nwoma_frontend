import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.3-gec.com/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure we never send '0' or empty string for ID fields if they are intended to be relations
    // This is a safety measure for the UUID migration
    if (config.data && typeof config.data === 'object') {
      Object.keys(config.data).forEach(key => {
        if (key.endsWith('_id') || key === 'id') {
          if (config.data[key] === 0 || config.data[key] === '0' || config.data[key] === '') {
            config.data[key] = null;
          }
        }
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const { data } = response;

    // Automated API Response Unwrapping
    if (data && typeof data === 'object' && 'success' in data) {
      // Toast message for successful mutations
      if (data.message && response.config.method !== 'get' && data.success) {
        toast.success(data.message);
      }

      // Return unwrapped data
      return {
        ...response,
        data: data.data
      };
    }

    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // 2. Advanced Validation & Error Mapping (Status 422)
      if (response.status === 422) {
        const validationError = new Error(response.data.message || 'Validation failed') as any;
        validationError.status = 422;
        validationError.validationErrors = response.data.errors;
        validationError.isValidationError = true;
        return Promise.reject(validationError);
      }

      // 6. Rate Limiting (Status 429)
      if (response.status === 429) {
        const retryAfter = response.headers['retry-after'] || 60;
        const rateLimitError = new Error(`Too many requests. Please try again in ${retryAfter} seconds.`) as any;
        rateLimitError.status = 429;
        rateLimitError.retryAfter = parseInt(retryAfter as string, 10);
        toast.error(rateLimitError.message);
        return Promise.reject(rateLimitError);
      }

      // Handle 401 Unauthorized
      if (response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }

      // Default error toast for mutations
      if (response.config.method !== 'get' && response.data?.message) {
        toast.error(response.data.message);
      } else if (response.status === 500) {
        console.error('Server Error (500):', response.data);
        // Only toast 500s if we're not on a page that handles it locally
        if (!['/'].includes(window.location.pathname)) {
          toast.error("Internal Server Error. Please contact support.");
        }
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
