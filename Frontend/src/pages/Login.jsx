import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckSquare, Eye, EyeOff, Mail, Lock } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido'
    }

    if (!formData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida'
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await login(formData)
    
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckSquare className="h-12 w-12 text-primary-900" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-primary-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-primary-600">
          ¿No tienes cuenta?{' '}
          <Link 
            to="/register" 
            className="font-medium text-primary-900 hover:text-primary-800 transition-colors duration-200"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-primary-700">
                Correo Electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.correo ? 'input-error' : ''}`}
                  placeholder="usuario@ejemplo.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
              {errors.correo && (
                <p className="mt-1 text-sm text-error-600">{errors.correo}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="contraseña" className="block text-sm font-medium text-primary-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="contraseña"
                  name="contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.contraseña}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.contraseña ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-primary-400 hover:text-primary-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.contraseña && (
                <p className="mt-1 text-sm text-error-600">{errors.contraseña}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-sm text-right">
              <Link 
                to="/forgot-password" 
                className="font-medium text-primary-900 hover:text-primary-800 transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
