import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import tasksService from '../services/tasks'
import toast from 'react-hot-toast'
import { Plus, CheckSquare, Clock, User, Calendar, Search, Filter, MoreVertical, Eye, CheckCircle, Trash2 } from 'lucide-react'
import CompleteTaskModal from '../components/CompleteTaskModal'
import DeleteTaskModal from '../components/DeleteTaskModal'
import TaskDetailsModal from '../components/TaskDetailsModal'

const Dashboard = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({ titulo: '', descripcion: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, completed, deleted, all_including_deleted
  const [createLoading, setCreateLoading] = useState(false)
  
  // Modal states
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [filter]) // Reload when filter changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeDropdown])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksService.getTasks(filter)
      setTasks(response.tareas || [])
      setActiveDropdown(null) // Close any open dropdowns
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error('Error al cargar las tareas')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!newTask.titulo.trim() || !newTask.descripcion.trim()) {
      toast.error('Título y descripción son requeridos')
      return
    }

    try {
      setCreateLoading(true)
      await tasksService.createTask(newTask)
      toast.success('Tarea creada exitosamente')
      setNewTask({ titulo: '', descripcion: '' })
      setShowCreateForm(false)
      loadTasks() // Reload tasks
    } catch (error) {
      console.error('Error creating task:', error)
      // toast.error is handled by axios interceptor
    } finally {
      setCreateLoading(false)
    }
  }

  // Task action handlers
  const handleCompleteTask = (task) => {
    if (task.completada) {
      toast.error('Esta tarea ya está completada')
      return
    }
    if (task.borrada) {
      toast.error('No se puede completar una tarea borrada')
      return
    }
    setSelectedTask(task)
    setCompleteModalOpen(true)
    setActiveDropdown(null)
  }

  const handleDeleteTask = (task) => {
    if (task.borrada) {
      toast.error('Esta tarea ya está borrada')
      return
    }
    setSelectedTask(task)
    setDeleteModalOpen(true)
    setActiveDropdown(null)
  }

  const handleViewDetails = (task) => {
    setSelectedTask(task)
    setDetailsModalOpen(true)
    setActiveDropdown(null)
  }

  const handleModalClose = () => {
    setCompleteModalOpen(false)
    setDeleteModalOpen(false)
    setDetailsModalOpen(false)
    setSelectedTask(null)
  }

  const handleTaskUpdated = () => {
    loadTasks()
  }

  // Client-side search filtering (backend handles state filtering)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Calculate stats for all tasks (not filtered)
  const getTaskStats = () => {
    // For stats, we need all tasks regardless of current filter
    const allTasksForStats = filter === 'all' || filter === 'all_including_deleted' ? tasks : []
    return {
      completed: allTasksForStats.filter(t => t.completada && !t.borrada).length,
      pending: allTasksForStats.filter(t => !t.completada && !t.borrada).length,
      deleted: allTasksForStats.filter(t => t.borrada).length,
      total: allTasksForStats.length
    }
  }

  const stats = getTaskStats()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-primary-600">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">
              ¡Hola, {user?.nombreUsuario}!
            </h1>
            <p className="text-primary-600 mt-1">
              Tienes {stats.pending} tareas pendientes
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <CheckSquare className="w-8 h-8 text-success-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary-900">
            {stats.completed}
          </h3>
          <p className="text-primary-600">Completadas</p>
        </div>
        
        <div className="card text-center">
          <Clock className="w-8 h-8 text-warning-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary-900">
            {stats.pending}
          </h3>
          <p className="text-primary-600">Pendientes</p>
        </div>
        
        <div className="card text-center">
          <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary-900">
            {stats.deleted}
          </h3>
          <p className="text-primary-600">Borradas</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
          </div>
          
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input pl-10 pr-8"
            >
              <option value="all">Activas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
              <option value="deleted">Borradas</option>
              <option value="all_including_deleted">Todas (inc. borradas)</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <CheckSquare className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No se encontraron tareas' : 'No tienes tareas aún'}
            </h3>
            <p className="text-primary-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda'
                : '¡Crea tu primera tarea para comenzar!'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Crear Primera Tarea
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const taskStatus = task.borrada ? 'deleted' : task.completada ? 'completed' : 'pending'
            const statusColors = {
              pending: 'border-l-yellow-400 bg-yellow-50',
              completed: 'border-l-green-400 bg-green-50',
              deleted: 'border-l-red-400 bg-red-50'
            }
            
            return (
              <div key={task.id} className={`card-hover border-l-4 ${statusColors[taskStatus]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        task.completada 
                          ? 'bg-success-500 border-success-500'
                          : task.borrada
                          ? 'bg-red-500 border-red-500'
                          : 'border-primary-300'
                      }`}>
                        {task.completada && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                        {task.borrada && (
                          <Trash2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <h3 className={`text-lg font-medium ${
                        task.completada ? 'text-green-700 line-through' : 
                        task.borrada ? 'text-red-700 line-through' :
                        'text-primary-900'
                      }`}>
                        {task.titulo}
                      </h3>
                      {task.borrada && (
                        <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                          Borrada
                        </span>
                      )}
                      {task.completada && !task.borrada && (
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Completada
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      task.completada || task.borrada ? 'text-primary-400' : 'text-primary-600'
                    }`}>
                      {task.descripcion}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-primary-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Creada: {formatDate(task.fechaCreacion)}
                      </div>
                      {task.completada && task.fechaCompletada && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completada: {formatDate(task.fechaCompletada)}
                        </div>
                      )}
                      {task.borrada && task.fechaBorrado && (
                        <div className="flex items-center text-red-600">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Borrada: {formatDate(task.fechaBorrado)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <div className="relative ml-4">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                      className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeDropdown === task.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-100 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="w-full px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-3" />
                            Ver Detalles
                          </button>
                          
                          {!task.completada && !task.borrada && (
                            <button
                              onClick={() => handleCompleteTask(task)}
                              className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-3" />
                              Completar Tarea
                            </button>
                          )}
                          
                          {!task.borrada && (
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Borrar Tarea
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-4">
                Crear Nueva Tarea
              </h2>
              
              <form onSubmit={createTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newTask.titulo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, titulo: e.target.value }))}
                    className="input w-full"
                    placeholder="Ej: Completar proyecto..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newTask.descripcion}
                    onChange={(e) => setNewTask(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="input w-full h-24 resize-none"
                    placeholder="Describe los detalles de tu tarea..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewTask({ titulo: '', descripcion: '' })
                    }}
                    className="btn-secondary"
                    disabled={createLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      'Crear Tarea'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Action Modals */}
      <CompleteTaskModal
        isOpen={completeModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
      
      <DeleteTaskModal
        isOpen={deleteModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
      
      <TaskDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
      />
    </div>
  )
}

export default Dashboard
