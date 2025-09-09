import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckSquare, CheckCircle, XCircle } from 'lucide-react'

const ConfirmAccount = () => {
  const { token } = useParams()
  const { confirmAccount } = useAuth()
  const [status, setStatus] = useState('loading') // loading, success, error

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setStatus('error')
        return
      }

      const result = await confirmAccount(token)
      setStatus(result.success ? 'success' : 'error')
    }

    confirm()
  }, [token, confirmAccount])

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckSquare className="h-12 w-12 text-primary-900" />
        </div>
        
        <div className="mt-8">
          <div className="card text-center">
            {status === 'loading' && (
              <>
                <div className="loading-spinner mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-primary-900 mb-2">
                  Confirmando cuenta...
                </h2>
                <p className="text-primary-600">
                  Espera un momento mientras confirmamos tu cuenta.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary-900 mb-2">
                  ¡Cuenta Confirmada!
                </h2>
                <p className="text-primary-600 mb-6">
                  Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión.
                </p>
                <Link to="/login" className="btn-primary">
                  Iniciar Sesión
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-warning-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary-900 mb-2">
                  Enlace de Confirmación No Válido
                </h2>
                <div className="text-primary-600 mb-6 space-y-3">
                  <p>
                    Este enlace de confirmación ya fue utilizado o ha expirado.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800 text-sm font-medium mb-2">
                      ¿Ya confirmaste tu cuenta?
                    </p>
                    <p className="text-blue-700 text-sm">
                      Si ya confirmaste tu cuenta anteriormente, puedes iniciar sesión directamente.
                      No necesitas confirmar nuevamente.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/login" className="btn-primary">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-secondary">
                    Crear Nueva Cuenta
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmAccount
