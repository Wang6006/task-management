import axios from 'axios'
import { DEFAULT_AVATAR } from '@/constants'
import { API_BASE_URL } from './config'

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Axios wrapper
async function efetch(url, options = {}) {
  try {
    const response = await api.request({
      url,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.data,
      params: options.params,
    })

    const json = response.data
    if (json.status !== 'success') {
      throw new Error(json.message || 'Unknown error occurred')
    }

    return json.data
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unknown error occurred'
    throw new Error(message)
  }
}

function makeTasksService() {
  const baseUrl = '/tasks'
  const submitUrl = '/assignments'

  async function fetchTasks(page, limit = 10) {
    try {
      const params = { page, limit }
      const data = await efetch(baseUrl, { params })

      if (!data || !data.tasks) {
        throw new Error('Invalid response structure from server')
      }

      return {
        ...data,
        tasks: data.tasks.map((task) => ({
          ...task,
          assignedUser: task.assignedUser || null,
        })),
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  }

  async function fetchTask(id) {
    const { task } = await efetch(`${baseUrl}/${id}`)
    return {
      ...task,
      assignedUser: task.assignedUser || null,
    }
  }

  async function createTask(task) {
    return efetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: task,
    })
  }

  async function updateTask(id, task) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      data: task,
    })
  }

  async function deleteTask(id) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
    })
  }

  async function deleteAllTasks() {
    return efetch(baseUrl, {
      method: 'DELETE',
    })
  }

  async function submitTaskFile({ userId, taskId, file }) {
    const formData = new FormData()
    formData.append('userId', String(userId))
    formData.append('taskId', String(taskId))
    formData.append('file', file)

    try {
      const response = await api.post(submitUrl, formData)
      const result = response.data

      if (result.status === 'success') {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message || 'Failed to submit' }
      }
    } catch (error) {
      console.error('Error in submitTaskFile:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to submit',
      }
    }
  }

  return {
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    deleteAllTasks,
    submitTaskFile,
  }
}

export default makeTasksService()
