import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.mensaje || 
                   error.response?.data?.error || 
                   'Error de conexión'
    
    // Don't show toast for auth endpoints to avoid spam
    if (!error.config?.url?.includes('/login') && 
        !error.config?.url?.includes('/register')) {
      toast.error(message)
    }
    
    // If token is invalid, clear it
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    
    return Promise.reject(error)
  }
)

export default api
