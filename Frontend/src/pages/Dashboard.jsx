import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import tasksService from '../services/tasks'
import toast from 'react-hot-toast'
import { Plus, CheckSquare, Clock, User, Calendar, Search, Filter } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({ titulo: '', descripcion: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, completed, pending
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksService.getTasks()
      setTasks(response.tareas || [])
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'completed') return matchesSearch && task.completada
    if (filter === 'pending') return matchesSearch && !task.completada
    return matchesSearch
  })

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
              Tienes {tasks.filter(t => !t.completada).length} tareas pendientes
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
            {tasks.filter(t => t.completada).length}
          </h3>
          <p className="text-primary-600">Completadas</p>
        </div>
        
        <div className="card text-center">
          <Clock className="w-8 h-8 text-warning-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary-900">
            {tasks.filter(t => !t.completada).length}
          </h3>
          <p className="text-primary-600">Pendientes</p>
        </div>
        
        <div className="card text-center">
          <User className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-primary-900">
            {tasks.length}
          </h3>
          <p className="text-primary-600">Total</p>
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
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
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
          filteredTasks.map((task) => (
            <div key={task.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      task.completada 
                        ? 'bg-success-500 border-success-500'
                        : 'border-primary-300'
                    }`}>
                      {task.completada && (
                        <CheckSquare className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <h3 className={`text-lg font-medium ${
                      task.completada ? 'text-primary-500 line-through' : 'text-primary-900'
                    }`}>
                      {task.titulo}
                    </h3>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    task.completada ? 'text-primary-400' : 'text-primary-600'
                  }`}>
                    {task.descripcion}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-primary-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Creada: {formatDate(task.fechaCreacion)}
                    </div>
                    {task.fechaActualizacion !== task.fechaCreacion && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Actualizada: {formatDate(task.fechaActualizacion)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
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
    </div>
  )
}

export default Dashboard
