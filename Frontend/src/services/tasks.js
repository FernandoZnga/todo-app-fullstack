import api from './api'

export const tasksService = {
  // Get tasks for the current user with filters
  getTasks: async (filter = 'all') => {
    const response = await api.get(`/tareas?filter=${filter}`)
    return response.data
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tareas', taskData)
    return response.data
  },

  // Complete a task with comment
  completeTask: async (taskId, comment) => {
    const response = await api.put(`/tareas/${taskId}/complete`, { comentario: comment })
    return response.data
  },

  // Soft delete a task with comment
  deleteTask: async (taskId, comment) => {
    const response = await api.delete(`/tareas/${taskId}`, { data: { comentario: comment } })
    return response.data
  },

  // Update task (if backend supports it in the future)
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tareas/${taskId}`, taskData)
    return response.data
  }
}

export default tasksService
