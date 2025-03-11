
import axios from 'axios';
import { toast } from 'sonner';

// Create a base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.diagnosphere.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.message || 
      "An unexpected error occurred. Please try again.";
    
    toast.error(message);
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },
};

// Skin disease diagnosis endpoints
export const diagnosisAPI = {
  uploadImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await api.post('/diagnosis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  submitSymptoms: async (diagnosisId: string, symptoms: Record<string, any>) => {
    const response = await api.post(`/diagnosis/${diagnosisId}/symptoms`, symptoms);
    return response.data;
  },
  
  getResults: async (diagnosisId: string) => {
    const response = await api.get(`/diagnosis/${diagnosisId}/results`);
    return response.data;
  },
  
  getUserHistory: async () => {
    const response = await api.get('/diagnosis/history');
    return response.data;
  },
};

export default api;
