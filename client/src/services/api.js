import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Firebase or demo token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fresher_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to unwrap data and handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage = error?.response?.data?.message || error.message || 'An error occurred';
    const err = new Error(customMessage);
    err.status = error?.response?.status;
    err.code = error?.response?.data?.code;
    err.details = error?.response?.data?.details;
    return Promise.reject(err);
  }
);

// Auth & User API
export const syncUserWithBackend = (userData) => api.post('/auth/sync', userData);
export const fetchCurrentUser = () => api.get('/me');
export const addInterviewCoins = (amount) => api.post('/me/coins/add', { amount });

// Dashboard API
export const fetchDashboardStats = () => api.get('/dashboard/stats');

// Resume API
export const uploadResumePdf = (formData) => api.post('/resume/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const analyzeResumeScore = (payload) => {
  if (payload instanceof FormData) {
    return api.post('/resume/score', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/resume/score', payload);
};
export const fetchUserResume = () => api.get('/resume/me');
export const generateAIBullets = (payload) => api.post('/resume/builder/generate', payload);
export const fetchResumeDraft = () => api.get('/resume/builder/draft');
export const saveResumeDraft = (data) => api.put('/resume/builder/draft', { data });

// Interview API
export const startNewInterview = (payload) => api.post('/interviews', payload);
export const fetchAllInterviews = () => api.get('/interviews');
export const fetchInterviewSession = (id) => api.get(`/interviews/${id}`);
export const submitAnswer = (id, payload) => api.post(`/interviews/${id}/answer`, payload);
export const fetchInterviewReport = (id) => api.get(`/interviews/${id}/report`);

// Roadmap API
export const generateRoadmap = (payload) => api.post('/roadmaps', payload);
export const fetchAllRoadmaps = () => api.get('/roadmaps');
export const fetchRoadmapById = (id) => api.get(`/roadmaps/${id}`);

export default api;

