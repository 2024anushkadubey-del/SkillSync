import axios from 'axios';

// Resolve API base URL: use production VITE_API_URL if configured, otherwise fallback to local '/api'
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleaned = envUrl.trim().replace(/\/$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

// Create a centralized Axios instance configured for the SkillSync API layer
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT session token if present
api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem('skillsync_auth');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth token from localStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred.',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

// Standard SWR Fetcher helper
export const fetcher = async (url) => {
  const response = await api.get(url);
  return response.data;
};

// ==========================================
// CENTRALIZED SERVICE MODULES
// ==========================================

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const studentsApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/students', { params });
    return res.data;
  },
};

export const categoriesApi = {
  getAll: async (params = {}) => {
    const res = await api.get('/categories', { params });
    return res.data;
  },
};

export const profileApi = {
  getProfile: async () => {
    const res = await api.get('/user/profile');
    return res.data;
  },
};

export const skillsApi = {
  getAll: async () => {
    const res = await api.get('/skills');
    return res.data;
  },
  addSkill: async (skillData) => {
    const res = await api.post('/skills', skillData);
    return res.data;
  },
  updateSkill: async (id, updates) => {
    const res = await api.patch(`/skills/${id}`, updates);
    return res.data;
  },
  deleteSkill: async (id) => {
    const res = await api.delete(`/skills/${id}`);
    return res.data;
  },
};

export const activityApi = {
  getAll: async () => {
    const res = await api.get('/activity');
    return res.data;
  },
  createSwapRequest: async (swapData) => {
    const res = await api.post('/swap-requests', swapData);
    return res.data;
  },
};

export const protectedApi = {
  getUserData: async () => {
    const res = await api.get('/protected/user');
    return res.data;
  },
  getAdminData: async () => {
    const res = await api.get('/protected/admin');
    return res.data;
  },
};

export const announcementsApi = {
  getAll: async () => {
    const res = await api.get('/announcements');
    return res.data;
  },
  publish: async (message) => {
    const res = await api.post('/announcements', { message });
    return res.data;
  },
};

export default api;
