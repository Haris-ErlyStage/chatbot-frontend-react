// src/services/api.js
import axios from 'axios';

// export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
export const API_BASE_URL = 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },
  
  signup: async (fullName, email, password) => {
    const response = await apiClient.post('/signup', { fullName, email, password });
    return response.data;
  },
  
  // Chat endpoints
  getChatHistory: async (userId) => {
    const response = await apiClient.get(`/user/${userId}/threads`);
    return response.data;
  },
  
  loadThread: async (userId, threadId) => {
    const response = await apiClient.get(`/user/${userId}/threads/${threadId}/messages`);
    return response.data;
  },
  
  sendMessage: async (userId, threadId, message, pdfIds) => {
    const response = await apiClient.post('/chat', {
      user_id: userId,
      thread_id: threadId,
      message,
      pdf_ids: pdfIds
    });
    return response.data;
  },
  
  // File endpoints
  uploadFiles: async (userId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('user_id', userId);
    
    const response = await apiClient.post('/upload_pdfs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  listFiles: async (userId) => {
    const response = await apiClient.get(`/user/${userId}/files`);
    return response.data;
  },
  
  deleteFile: async (userId, fileId) => {
    const response = await apiClient.delete(`/user/${userId}/files/${fileId}`);
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};