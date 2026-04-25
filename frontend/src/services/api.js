import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dsa_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dsa_token')
      localStorage.removeItem('dsa_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
}

// ── Progress ─────────────────────────────────────────────────────────
export const progressApi = {
  getAll: (params) => api.get('/progress', { params }),
  create: (data) => api.post('/progress', data),
  update: (id, data) => api.put(`/progress/${id}`, data),
  delete: (id) => api.delete(`/progress/${id}`),
}

// ── Stats ─────────────────────────────────────────────────────────────
export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
}
