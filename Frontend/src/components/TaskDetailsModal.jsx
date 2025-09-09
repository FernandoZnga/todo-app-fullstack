import React from 'react'
import Modal from './Modal'
import { Calendar, Clock, CheckCircle, Trash2, FileText, AlertCircle } from 'lucide-react'

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!task) return null

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTaskStatus = () => {
    if (task.borrada) return 'deleted'
    if (task.completada) return 'completed'
    return 'pending'
  }

  const getStatusInfo = () => {
    const status = getTaskStatus()
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completada',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'deleted':
        return {
          icon: Trash2,
          text: 'Borrada',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: Clock,
          text: 'Pendiente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles de la Tarea"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Task Header */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${statusInfo.color} mb-1`}>
                {task.titulo}
              </h3>
              <p className="text-primary-600 text-sm">
                {task.descripcion}
              </p>
            </div>
            <div className={`flex items-center ${statusInfo.color} font-medium text-sm`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.text}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-primary-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Historial de la Tarea
          </h4>

          <div className="space-y-3">
            {/* Created */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Tarea Creada</span>
                  <span className="text-sm text-blue-600">
                    {formatDate(task.fechaCreacion)}
                  </span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  La tarea fue creada exitosamente
                </p>
              </div>
            </div>

            {/* Updated (if different from created) */}
            {task.fechaActualizacion !== task.fechaCreacion && !task.completada && !task.borrada && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Última Actualización</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(task.fechaActualizacion)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    La tarea fue modificada
                  </p>
                </div>
              </div>
            )}

            {/* Completed */}
            {task.completada && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">Tarea Completada</span>
                    <span className="text-sm text-green-600">
                      {formatDate(task.fechaCompletada)}
                    </span>
                  </div>
                  {task.comentarioCompletar && (
                    <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                      <strong>Comentario:</strong> {task.comentarioCompletar}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deleted */}
            {task.borrada && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-900">Tarea Borrada</span>
                    <span className="text-sm text-red-600">
                      {formatDate(task.fechaBorrado)}
                    </span>
                  </div>
                  {task.comentarioBorrado && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                      <strong>Motivo:</strong> {task.comentarioBorrado}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Metadata */}
        <div className="border-t border-primary-200 pt-4">
          <h4 className="text-sm font-medium text-primary-900 mb-3">Información Adicional</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-primary-600">ID de Tarea:</span>
              <span className="ml-2 font-mono text-primary-900">#{task.id}</span>
            </div>
            <div>
              <span className="text-primary-600">Estado:</span>
              <span className={`ml-2 font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskDetailsModal
