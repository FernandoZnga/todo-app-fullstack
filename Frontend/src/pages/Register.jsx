import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckSquare, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombreUsuario) {
      newErrors.nombreUsuario = 'El nombre es requerido'
    } else if (formData.nombreUsuario.length < 2) {
      newErrors.nombreUsuario = 'El nombre debe tener al menos 2 caracteres'
    }

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

    if (!formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Confirma tu contraseña'
    } else if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await register({
      nombreUsuario: formData.nombreUsuario,
      correo: formData.correo,
      contraseña: formData.contraseña
    })
    
    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckSquare className="h-12 w-12 text-primary-900" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-primary-900">
          Crear Cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-primary-600">
          ¿Ya tienes cuenta?{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary-900 hover:text-primary-800 transition-colors duration-200"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="nombreUsuario" className="block text-sm font-medium text-primary-700">
                Nombre Completo
              </label>
              <div className="mt-1 relative">
                <input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  type="text"
                  autoComplete="name"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.nombreUsuario ? 'input-error' : ''}`}
                  placeholder="Juan Pérez"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
              {errors.nombreUsuario && (
                <p className="mt-1 text-sm text-error-600">{errors.nombreUsuario}</p>
              )}
            </div>

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
                  autoComplete="new-password"
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.contraseña && (
                <p className="mt-1 text-sm text-error-600">{errors.contraseña}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmarContraseña" className="block text-sm font-medium text-primary-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmarContraseña"
                  name="confirmarContraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmarContraseña}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.confirmarContraseña ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-primary-400 hover:text-primary-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmarContraseña && (
                <p className="mt-1 text-sm text-error-600">{errors.confirmarContraseña}</p>
              )}
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
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
