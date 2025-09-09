import React, { useState } from 'react'
import Modal from './Modal'
import tasksService from '../services/tasks'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'

const CompleteTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      toast.error('El comentario es requerido para completar la tarea')
      return
    }

    if (comment.trim().length > 500) {
      toast.error('El comentario no puede exceder 500 caracteres')
      return
    }

    try {
      setIsSubmitting(true)
      await tasksService.completeTask(task.id, comment.trim())
      toast.success('Tarea completada exitosamente')
      setComment('')
      onClose()
      onTaskUpdated() // Refresh tasks list
    } catch (error) {
      console.error('Error completing task:', error)
      // Error handling is managed by axios interceptor, but we can show a generic message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Error al completar la tarea')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setComment('')
    onClose()
  }

  if (!task) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Completar Tarea"
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Task Info */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
          <h3 className="font-medium text-primary-900 mb-1">{task.titulo}</h3>
          <p className="text-sm text-primary-600">{task.descripcion}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Comentario de finalización <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input w-full h-32 resize-none"
              placeholder="Describe cómo completaste la tarea, resultados obtenidos, etc..."
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-primary-500 mt-1">
              {comment.length}/500 caracteres
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  ¿Estás seguro de completar esta tarea?
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Una vez completada, no podrás editarla, pero podrás verla en el historial.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary bg-green-600 hover:bg-green-700 flex items-center"
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completar Tarea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default CompleteTaskModal
