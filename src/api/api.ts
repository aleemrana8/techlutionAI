import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
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
  attachments?: File[]
}) => {
  if (data.attachments && data.attachments.length > 0) {
    const fd = new FormData()
    fd.append('name', data.name)
    if (data.email) fd.append('email', data.email)
    if (data.phone) fd.append('phone', data.phone)
    if (data.service) fd.append('service', data.service)
    fd.append('message', data.message)
    data.attachments.forEach(f => fd.append('attachments', f))
    return API.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  const { attachments, ...rest } = data
  return API.post('/contact', rest)
}

export const submitProject = (data: {
  name: string
  email?: string
  phone?: string
  service: string
  budget?: string
  timeline?: string
  message: string
  attachments?: File[]
}) => {
  if (data.attachments && data.attachments.length > 0) {
    const fd = new FormData()
    fd.append('name', data.name)
    if (data.email) fd.append('email', data.email)
    if (data.phone) fd.append('phone', data.phone)
    fd.append('service', data.service)
    if (data.budget) fd.append('budget', data.budget)
    if (data.timeline) fd.append('timeline', data.timeline)
    fd.append('message', data.message)
    data.attachments.forEach(f => fd.append('attachments', f))
    return API.post('/contact/project', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  const { attachments, ...rest } = data
  return API.post('/contact/project', rest)
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export const sendChatMessage = (
  message: string,
  sessionId?: string,
  history?: { user: string; bot: string }[],
) => API.post('/chat', { message, sessionId, history })

// ─── Chat Stream (SSE) ──────────────────────────────────────────────────────

export function streamChatMessage(
  message: string,
  sessionId: string,
  history: { user: string; bot: string }[],
  onChunk: (text: string) => void,
  onMeta?: (meta: { intent: string; language: string }) => void,
  onDone?: () => void,
  onError?: (err: Error) => void,
): () => void {
  const baseUrl = import.meta.env.VITE_API_URL || '/api'
  const params = new URLSearchParams({
    message,
    sessionId,
    history: JSON.stringify(history.slice(-6)),
  })
  const url = baseUrl + '/chat-stream?' + params.toString()

  let aborted = false

  // Use fetch for streaming to handle chunked SSE properly
  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok || !response.body) {
        throw new Error('Stream request failed: ' + response.status)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done || aborted) break
        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') {
            onDone?.()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'meta' && onMeta) {
              onMeta(parsed)
            } else if (parsed.type === 'chunk' && parsed.text) {
              onChunk(parsed.text)
            }
          } catch { /* skip malformed JSON */ }
        }
      }
      onDone?.()
    } catch (err: any) {
      if (!aborted && err.name !== 'AbortError') {
        onError?.(err)
      }
    }
  })()

  // Return abort function
  return () => {
    aborted = true
    controller.abort()
  }
}

export default API
