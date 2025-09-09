import React, { useState } from 'react'
import Modal from './Modal'
import tasksService from '../services/tasks'
import toast from 'react-hot-toast'
import { Trash2, AlertTriangle } from 'lucide-react'

const DeleteTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      toast.error('El comentario es requerido para borrar la tarea')
      return
    }

    if (comment.trim().length > 500) {
      toast.error('El comentario no puede exceder 500 caracteres')
      return
    }

    try {
      setIsSubmitting(true)
      await tasksService.deleteTask(task.id, comment.trim())
      toast.success('Tarea borrada exitosamente')
      setComment('')
      onClose()
      onTaskUpdated() // Refresh tasks list
    } catch (error) {
      console.error('Error deleting task:', error)
      // Error handling is managed by axios interceptor, but we can show a generic message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Error al borrar la tarea')
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
      title="Borrar Tarea"
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Task Info */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <h3 className="font-medium text-red-900 mb-1">{task.titulo}</h3>
          <p className="text-sm text-red-600">{task.descripcion}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Motivo del borrado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input w-full h-32 resize-none"
              placeholder="Explica por qué estás borrando esta tarea (cambio de prioridades, tarea duplicada, etc...)"
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-primary-500 mt-1">
              {comment.length}/500 caracteres
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  ¿Estás seguro de borrar esta tarea?
                </p>
                <p className="text-xs text-red-600 mt-1">
                  La tarea se moverá a la papelera, pero podrás verla en el filtro de "Borradas" si necesitas recuperar la información.
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
              className="btn-primary bg-red-600 hover:bg-red-700 flex items-center"
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Borrando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Borrar Tarea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default DeleteTaskModal
