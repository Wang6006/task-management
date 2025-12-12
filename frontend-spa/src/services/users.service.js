import axios from 'axios'
import { API_BASE_URL } from '@/services/config.js'

// Create Axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptor to include token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Utility wrapper to handle Axios requests
async function efetch(url, options = {}) {
  try {
    const response = await api.request({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      params: options.params,
      headers: options.headers,
    })

    const json = response.data

    if (json.status !== 'success') {
      throw new Error(json.message || 'Unexpected error')
    }

    return json.data
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unexpected error'
    throw new Error(message)
  }
}

function makeUsersService() {
  const baseUrl = '/users'

  async function fetchUsers(page = 1, pageSize = 10, search = '') {
    const params = {
      ...(page && { page }),
      ...(pageSize && { pageSize }),
      ...(search && { search }),
    }
    const data = await efetch(baseUrl, { params })
    return data
  }

  async function fetchUser(id) {
    return await efetch(`${baseUrl}/${id}`)
  }

  async function createUser(data) {
    return await efetch('/auth/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async function loginUser({ username, password }) {
    console.log('[loginUser] Sending:', { username, password })
    const data = await efetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    console.log('[loginUser] Response data:', data)
    return data
  }

  async function updateUser(id, payload) {
    return await efetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  return {
    fetchUsers,
    fetchUser,
    createUser,
    loginUser,
    updateUser,
  }
}

export default makeUsersService()
