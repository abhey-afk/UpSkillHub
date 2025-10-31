import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://upskillhub-api.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 error detected:', error.response?.data);
      // Only logout if it's actually an auth error, not a failed login attempt
      if (error.config?.url !== '/auth/login') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => {
    const config = {
      headers: {
        'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    return api.put('/auth/profile', userData, config);
  },
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Course API calls
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  generateCourseWithAI: (prompt) => api.post('/courses/generate-ai', { prompt }),
  
  // Admin course management
  getPendingCourses: () => api.get('/courses/admin/pending'),
  getAllCoursesForAdmin: (params) => api.get('/courses/admin/all', { params }),
  approveCourse: (id) => api.put(`/courses/admin/${id}/approve`),
  rejectCourse: (id, data) => api.put(`/courses/admin/${id}/reject`, data),
};

// User API calls
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
};

// Payment API calls
export const paymentAPI = {
  createPaymentIntent: (courseId) => api.post('/payments/create-intent', { courseId }),
  confirmPayment: (sessionId) => api.post('/payments/confirm', { paymentIntentId: sessionId }),
  getPaymentHistory: () => api.get('/payments/history'),
};

// Analytics API calls
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getUserAnalytics: () => api.get('/analytics/users'),
};

export default api;
