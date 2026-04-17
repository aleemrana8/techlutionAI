import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Projects ────────────────────────────────────────────────────────────────

export const getProjects = (params?: Record<string, string>) =>
  API.get('/projects', { params })

export const getProjectById = (id: string) =>
  API.get(`/projects/${id}`)

export const generateProjectContent = (data: { title: string; category: string }) =>
  API.post('/projects/generate', data)

// ─── Contact ─────────────────────────────────────────────────────────────────

export const submitContact = (data: {
  name: string
  email?: string
  phone?: string
  service?: string
  message: string
}) => API.post('/contact', data)

export const submitProject = (data: {
  name: string
  email?: string
  phone?: string
  service: string
  budget?: string
  timeline?: string
  message: string
}) => API.post('/contact/project', data)

// ─── Chat ────────────────────────────────────────────────────────────────────

export const sendChatMessage = (message: string) =>
  API.post('/chat', { message })

export default API
