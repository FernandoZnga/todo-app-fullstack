import api from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/usuarios', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/usuarios/login', credentials)
    
    if (response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token)
      
      // Get user profile after successful login
      try {
        const profileResponse = await api.get('/usuarios/perfil')
        const userData = profileResponse.data.perfil
        localStorage.setItem('user', JSON.stringify(userData))
        
        return {
          token: response.data.token,
          user: userData
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        return { token: response.data.token, user: null }
      }
    }
    
    return response.data
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Confirm account
  confirmAccount: async (token) => {
    const response = await api.get(`/usuarios/confirmar/${token}`)
    return response.data
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/usuarios/olvide-password', { correo: email })
    return response.data
  },

  // Verify password reset token
  verifyResetToken: async (token) => {
    const response = await api.get(`/usuarios/olvide-password/${token}`)
    return response.data
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/usuarios/olvide-password/${token}`, { 
      password: newPassword 
    })
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/usuarios/perfil')
    return response.data.perfil
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Get current user data
  getCurrentUser: () => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default authService
