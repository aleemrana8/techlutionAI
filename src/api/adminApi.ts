import axios from 'axios'

const AdminAPI = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api') + '/admin',
  headers: { 'Content-Type': 'application/json' },
})

AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

AdminAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  },
)

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => AdminAPI.get('/dashboard')

// ─── Visitors ─────────────────────────────────────────────────────────────────
export const getVisitors = (params?: Record<string, string>) => AdminAPI.get('/visitors', { params })
export const getVisitorStats = () => AdminAPI.get('/visitors/stats')

// ─── Leads ────────────────────────────────────────────────────────────────────
export const getLeads = (params?: Record<string, string>) => AdminAPI.get('/leads', { params })
export const getLeadStats = () => AdminAPI.get('/leads/stats')
export const getLeadById = (id: string) => AdminAPI.get(`/leads/${id}`)
export const createLead = (data: any) => AdminAPI.post('/leads', data)
export const updateLead = (id: string, data: any) => AdminAPI.put(`/leads/${id}`, data)
export const deleteLead = (id: string) => AdminAPI.delete(`/leads/${id}`)

// ─── Clients ──────────────────────────────────────────────────────────────────
export const getClients = (params?: Record<string, string>) => AdminAPI.get('/clients', { params })
export const getClientStats = () => AdminAPI.get('/clients/stats')
export const getClientById = (id: string) => AdminAPI.get(`/clients/${id}`)
export const createClient = (data: any) => AdminAPI.post('/clients', data)
export const updateClient = (id: string, data: any) => AdminAPI.put(`/clients/${id}`, data)
export const deleteClient = (id: string) => AdminAPI.delete(`/clients/${id}`)

// ─── Employees (HR) ──────────────────────────────────────────────────────────
export const getEmployees = (params?: Record<string, string>) => AdminAPI.get('/employees', { params })
export const getEmployeeStats = () => AdminAPI.get('/employees/stats')
export const getEmployeeById = (id: string) => AdminAPI.get(`/employees/${id}`)
export const createEmployee = (data: any) => AdminAPI.post('/employees', data)
export const updateEmployee = (id: string, data: any) => AdminAPI.put(`/employees/${id}`, data)
export const deleteEmployee = (id: string) => AdminAPI.delete(`/employees/${id}`)

// ─── Finance ──────────────────────────────────────────────────────────────────
export const getFinanceRecords = (params?: Record<string, string>) => AdminAPI.get('/finance', { params })
export const getFinanceSummary = (params?: Record<string, string>) => AdminAPI.get('/finance/summary', { params })
export const getFinanceById = (id: string) => AdminAPI.get(`/finance/${id}`)
export const createFinanceRecord = (data: any) => AdminAPI.post('/finance', data)
export const updateFinanceRecord = (id: string, data: any) => AdminAPI.put(`/finance/${id}`, data)
export const deleteFinanceRecord = (id: string) => AdminAPI.delete(`/finance/${id}`)

export default AdminAPI
