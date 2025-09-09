import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      const token = authService.getToken()
      const userData = authService.getCurrentUser()
      
      if (token && userData) {
        setUser(userData)
        setIsAuthenticated(true)
      }
      
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      
      if (response.token) {
        setUser(response.user)
        setIsAuthenticated(true)
        toast.success('¡Bienvenido de vuelta!')
        return { success: true, data: response }
      }
      
      return { success: false, error: 'Error en la autenticación' }
    } catch (error) {
      const message = error.response?.data?.mensaje || 
                     error.response?.data?.error || 
                     'Error al iniciar sesión'
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      
      toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
      return { success: true, data: response }
    } catch (error) {
      const message = error.response?.data?.mensaje || 
                     error.response?.data?.error || 
                     'Error al registrar usuario'
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Sesión cerrada correctamente')
  }

  const confirmAccount = async (token) => {
    try {
      setLoading(true)
      const response = await authService.confirmAccount(token)
      
      toast.success('¡Cuenta confirmada! Ya puedes iniciar sesión.')
      return { success: true, data: response }
    } catch (error) {
      const message = error.response?.data?.mensaje || 
                     error.response?.data?.error || 
                     'Error al confirmar la cuenta'
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      const response = await authService.forgotPassword(email)
      
      toast.success('Email de recuperación enviado. Revisa tu bandeja de entrada.')
      return { success: true, data: response }
    } catch (error) {
      const message = error.response?.data?.mensaje || 
                     error.response?.data?.error || 
                     'Error al enviar email de recuperación'
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true)
      const response = await authService.resetPassword(token, newPassword)
      
      toast.success('¡Contraseña restablecida! Ya puedes iniciar sesión.')
      return { success: true, data: response }
    } catch (error) {
      const message = error.response?.data?.mensaje || 
                     error.response?.data?.error || 
                     'Error al restablecer contraseña'
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    confirmAccount,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
