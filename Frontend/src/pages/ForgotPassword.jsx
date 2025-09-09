import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckSquare, Mail, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { forgotPassword, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await forgotPassword(email)
    if (result.success) setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card text-center">
            <Mail className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary-900 mb-2">Email Enviado</h2>
            <p className="text-primary-600 mb-6">
              Revisa tu bandeja de entrada para restablecer tu contraseña.
            </p>
            <Link to="/login" className="btn-primary">Volver al Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckSquare className="h-12 w-12 text-primary-900" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-primary-900">
          Recuperar Contraseña
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-700">
                Correo Electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="usuario@ejemplo.com"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
