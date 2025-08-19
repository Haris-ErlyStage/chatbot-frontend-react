// src/services/api.js
import axios from 'axios';

/**
 * Base URL for the backend API
 */
export const API_BASE_URL = 'http://localhost:8001';

/**
 * Axios instance with default configuration for API requests
 * - Sets base URL, timeout, and default headers
 * - Includes credentials (cookies) with requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true // Important for session/cookie-based auth if used
});

/**
 * Request Interceptor
 * - Automatically adds the JWT Bearer token to the Authorization header
 *   if it exists in localStorage.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request:', token.substring(0, 10) + '...');
    } else {
      console.log('No auth token found for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Logs API responses and errors for debugging.
 * - Handles 401 Unauthorized responses by clearing local auth data
 *   and redirecting the user to the login page.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized errors (except on login page itself)
    if (!error.config?.url?.includes('/login') && error.response?.status === 401) {
      console.log('Authentication error, redirecting to login...');
      // Clear local authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Service Object
 * Contains methods to interact with all backend endpoints.
 */
export const api = {
  // --- AUTHENTICATION ENDPOINTS ---

  /**
   * User Login
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Login response data including access token and user info
   * @throws {Object} - Error response data from the server
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * User Signup/Registration
   * @param {string} full_name - User's full name
   * @param {string} email - User's email address
   * @param {string} username - Desired username
   * @param {string} password - User's password (minimum 6 characters)
   * @returns {Promise<Object>} - Signup response data including access token and user info
   * @throws {Object} - Error response data from the server
   */
  signup: async (full_name, email, username, password) => {
    try {
      const response = await apiClient.post('/signup', {
        full_name,
        email,
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  },

  // --- CHAT ENDPOINTS ---

  /**
   * Send a message to the AI chatbot
   * If thread_id is provided, continues an existing conversation.
   * If no thread_id, a new thread is created using all user's available PDFs.
   * @param {string} message - The user's message/question
   * @param {string|null} thread_id - (Optional) ID of the existing chat thread
   * @returns {Promise<Object>} - Chat response data including AI answer and thread info
   * @throws {Object} - Error response data from the server
   */
  sendMessage: async (payload) => {
    try {
      const response = await apiClient.post('/chat', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },
  /**
   * Upload one or more PDF files
   * @param {FileList|File[]} files
   * @param {string|null} thread_id - Optional: attach to existing thread
   * @param {Function} onUploadProgress - Optional: track upload %
   */
  uploadPDFs: async (files, thread_id = null, onUploadProgress = null) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    if (thread_id) {
      formData.append('thread_id', thread_id);
    }

    try {
      const response = await apiClient.post('/upload_pdfs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onUploadProgress) onUploadProgress(percent);
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Upload failed' };
    }
  },

  // --- THREADS ENDPOINTS ---

  /**
   * Get a list of all chat threads for the current user
   * @returns {Promise<Object>} - Object containing an array of thread objects
   * @throws {Object} - Error response data from the server
   */
  getThreads: async () => {
    try {
      const response = await apiClient.get('/threads');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch threads' };
    }
  },

  /**
   * Get all messages within a specific chat thread
   * @param {string} thread_id - ID of the chat thread
   * @returns {Promise<Object>} - Object containing the thread ID and an array of messages
   * @throws {Object} - Error response data from the server
   */
  getThreadMessages: async (thread_id) => {
    try {
      const response = await apiClient.get(`/threads/${thread_id}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  /**
   * Update the title of a specific chat thread
   * @param {string} thread_id - ID of the chat thread to update
   * @param {string} title - New title for the thread
   * @returns {Promise<Object>} - Success confirmation and updated thread info
   * @throws {Object} - Error response data from the server
   */
  updateThreadTitle: async (thread_id, title) => {
    try {
      const response = await apiClient.put(`/threads/${thread_id}/title`, { title });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update thread title' };
    }
  },


  // --- PDF MANAGEMENT ENDPOINTS ---

  /**
   * Upload one or more PDF files
   * - If thread_id is provided, the PDFs are added to that existing thread.
   * - If thread_id is NOT provided, a new thread is created containing the uploaded PDFs.
   * @param {FileList|File[]} files - List of PDF files to upload
   * @param {string|null} thread_id - (Optional) ID of an existing thread to add PDFs to
   * @returns {Promise<Object>} - Upload results, including new thread ID if created
   * @throws {Object} - Error response data from the server
   */
  uploadPDFs: async (files, thread_id = null) => {
    try {
      const formData = new FormData();

      // Append all selected files to the form data
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      // If adding to an existing thread, include the thread ID
      if (thread_id) {
        formData.append('thread_id', thread_id);
      }

      const response = await apiClient.post('/upload_pdfs/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000 // Longer timeout for potentially large file uploads
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload PDFs' };
    }
  },

  /**
   * Get a list of all PDFs uploaded by the current user
   * @returns {Promise<Object>} - Object containing an array of PDF metadata objects
   * @throws {Object} - Error response data from the server
   */
  listPDFs: async () => {
    try {
      const response = await apiClient.get('/list_pdfs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch PDFs' };
    }
  },

  /**
   * Delete a specific PDF file and its associated data
   * - Removes the PDF from the database.
   * - Deletes the FAISS vector database folder.
   * - Removes the PDF ID from the metadata of all threads that used it.
   * @param {string} pdf_id - ID of the PDF to delete
   * @returns {Promise<Object>} - Confirmation of deletion and impact on threads
   * @throws {Object} - Error response data from the server
   */
  deletePDF: async (pdf_id) => {
    try {
      const response = await apiClient.delete(`/delete_pdf/${pdf_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete PDF' };
    }
  },

  /**
   * Revalidate a thread's PDF references
   * - Checks the PDF IDs stored in the thread's metadata.
   * - Removes any IDs that correspond to PDFs that have been deleted.
   * - Useful for cleaning up stale references after PDF deletions.
   * @param {string} thread_id - ID of the thread to revalidate
   * @returns {Promise<Object>} - Status of revalidation, including counts of valid/removed PDFs
   * @throws {Object} - Error response data from the server
   */
  revalidateThread: async (thread_id) => {
    try {
      const response = await apiClient.post(`/threads/${thread_id}/revalidate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to revalidate thread' };
    }
  }
};

export default apiClient;