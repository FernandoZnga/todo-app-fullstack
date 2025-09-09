import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, Calendar, Shield, CheckCircle } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.nombreUsuario?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary-900">
              {user?.nombreUsuario || 'Usuario'}
            </h1>
            <p className="text-primary-600 mt-1">
              {user?.correo}
            </p>
            
            <div className="flex items-center mt-3">
              <div className="flex items-center text-sm text-success-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Cuenta verificada
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-900 mb-6 flex items-center">
          <User className="w-6 h-6 mr-2" />
          Información de la Cuenta
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Nombre Completo
              </label>
              <div className="input bg-primary-50 cursor-not-allowed flex items-center">
                <User className="w-5 h-5 text-primary-400 mr-3" />
                <span className="text-primary-700">
                  {user?.nombreUsuario || 'No disponible'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Correo Electrónico
              </label>
              <div className="input bg-primary-50 cursor-not-allowed flex items-center">
                <Mail className="w-5 h-5 text-primary-400 mr-3" />
                <span className="text-primary-700">
                  {user?.correo || 'No disponible'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                ID de Usuario
              </label>
              <div className="input bg-primary-50 cursor-not-allowed flex items-center">
                <Shield className="w-5 h-5 text-primary-400 mr-3" />
                <span className="text-primary-700 font-mono">
                  #{user?.id || 'No disponible'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Fecha de Registro
              </label>
              <div className="input bg-primary-50 cursor-not-allowed flex items-center">
                <Calendar className="w-5 h-5 text-primary-400 mr-3" />
                <span className="text-primary-700">
                  {formatDate(user?.fechaCreacion)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-900 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          Seguridad
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg border border-success-200">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-success-600 mr-3" />
              <div>
                <h3 className="font-medium text-success-900">
                  Cuenta Verificada
                </h3>
                <p className="text-sm text-success-700">
                  Tu cuenta de correo electrónico ha sido verificada
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h3 className="font-medium text-primary-900">
                  Contraseña Segura
                </h3>
                <p className="text-sm text-primary-700">
                  Tu contraseña está encriptada y almacenada de forma segura
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-900 mb-6">
          Resumen de Actividad
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-primary-50 rounded-lg">
            <h3 className="text-2xl font-bold text-primary-900 mb-2">
              Sesión Actual
            </h3>
            <p className="text-primary-600">
              Autenticado correctamente
            </p>
          </div>
          
          <div className="text-center p-6 bg-primary-50 rounded-lg">
            <h3 className="text-2xl font-bold text-primary-900 mb-2">
              Estado
            </h3>
            <p className="text-success-600 font-medium">
              Activo
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-primary-900 text-white">
        <h2 className="text-xl font-semibold mb-4">
          ¿Necesitas ayuda?
        </h2>
        <p className="text-primary-100 mb-4">
          Si tienes alguna pregunta sobre tu cuenta o necesitas soporte técnico, 
          no dudes en contactarnos.
        </p>
        <div className="text-sm text-primary-200">
          <p>📧 Email: soporte@todoapp.com</p>
          <p>🔗 Documentación: Disponible en /api-docs</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
