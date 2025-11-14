import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Profile API
export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (data) => api.put('/profile', data),
  rateUser: (userId, rating) => api.post(`/profile/${userId}/rate`, { rating }),
};

// University API
export const universityAPI = {
  getAll: () => api.get('/universities'),
};

// Chat API
export const chatAPI = {
  getRooms: () => api.get('/chatrooms'),
  getMessages: (roomId) => api.get(`/chatrooms/${roomId}/messages`),
  addAdmin: (roomId, userId) => api.post(`/chatrooms/${roomId}/admins`, { userId }),
};

export default api;
