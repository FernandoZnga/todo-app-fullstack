import api from './api'

export const tasksService = {
  // Get all tasks for the current user
  getTasks: async () => {
    const response = await api.get('/tareas')
    return response.data
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tareas', taskData)
    return response.data
  },

  // Update task (if backend supports it in the future)
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tareas/${taskId}`, taskData)
    return response.data
  },

  // Delete task (if backend supports it in the future)  
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tareas/${taskId}`)
    return response.data
  }
}

export default tasksService
