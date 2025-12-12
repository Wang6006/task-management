import axios from 'axios'
import { API_BASE_URL } from './config'

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to every request
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

function makeMessagesService() {
  const baseUrl = '/messages'

  async function sendMessage({ sender_id, receiver_id, content, task_id }) {
    console.log('📬 Sending message:')
    return efetch(`${baseUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        sender_id,
        receiver_id,
        content,
        task_id,
      },
    })
  }

  async function getMessagesByTaskId(taskId) {
    return efetch(baseUrl, {
      params: { task_id: taskId },
    })
  }

  console.log('📬 Messages service initialized with base URL:', baseUrl)

  return {
    sendMessage,
    getMessagesByTaskId,
  }
}

export default makeMessagesService()
