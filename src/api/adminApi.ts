import axios from 'axios'

const AdminAPI = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api') + '/admin',
  headers: { 'Content-Type': 'application/json' },
})

AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

AdminAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  },
)

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => AdminAPI.get('/dashboard')
export const getDashboardTrends = () => AdminAPI.get('/dashboard/trends')

// ─── Visitors ─────────────────────────────────────────────────────────────────
export const getVisitors = (params?: Record<string, string>) => AdminAPI.get('/visitors', { params })
export const getVisitorStats = () => AdminAPI.get('/visitors/stats')

// ─── Inquiries ────────────────────────────────────────────────────────────────
export const getInquiries = (params?: Record<string, string>) => AdminAPI.get('/inquiries', { params })
export const getInquiryStats = () => AdminAPI.get('/inquiries/stats')
export const getInquiryById = (id: string) => AdminAPI.get(`/inquiries/${id}`)
export const createInquiry = (data: any) => AdminAPI.post('/inquiries', data)
export const updateInquiry = (id: string, data: any) => AdminAPI.put(`/inquiries/${id}`, data)
export const respondToInquiry = (id: string, response: string) => AdminAPI.put(`/inquiries/${id}/respond`, { response })
export const ignoreInquiry = (id: string) => AdminAPI.put(`/inquiries/${id}/ignore`)
export const unignoreInquiry = (id: string) => AdminAPI.put(`/inquiries/${id}/unignore`)
export const startProjectFromInquiry = (id: string, data: any) => AdminAPI.post(`/inquiries/${id}/start-project`, data)
export const deleteInquiry = (id: string) => AdminAPI.delete(`/inquiries/${id}`)

// ─── Clients ──────────────────────────────────────────────────────────────────
export const getClients = (params?: Record<string, string>) => AdminAPI.get('/clients', { params })
export const getClientStats = () => AdminAPI.get('/clients/stats')
export const getClientById = (id: string) => AdminAPI.get(`/clients/${id}`)
export const createClient = (data: any) => AdminAPI.post('/clients', data)
export const updateClient = (id: string, data: any) => AdminAPI.put(`/clients/${id}`, data)
export const deleteClient = (id: string) => AdminAPI.delete(`/clients/${id}`)

// ─── Employees (Members) ──────────────────────────────────────────────────────
export const getEmployees = (params?: Record<string, string>) => AdminAPI.get('/employees', { params })
export const getEmployeeStats = () => AdminAPI.get('/employees/stats')
export const getEmployeeById = (id: string) => AdminAPI.get(`/employees/${id}`)
export const getEmployeeAssignments = (id: string) => AdminAPI.get(`/employees/${id}/assignments`)
export const getEmployeeTasks = (id: string) => AdminAPI.get(`/employees/${id}/tasks`)
export const createEmployee = (data: any) => AdminAPI.post('/employees', data)
export const updateEmployee = (id: string, data: any) => AdminAPI.put(`/employees/${id}`, data)
export const deleteEmployee = (id: string) => AdminAPI.delete(`/employees/${id}`)

// ─── Proposals ────────────────────────────────────────────────────────────────
export const getProposals = (params?: Record<string, string>) => AdminAPI.get('/proposals', { params })
export const getProposalStats = () => AdminAPI.get('/proposals/stats')
export const getProposalById = (id: string) => AdminAPI.get(`/proposals/${id}`)
export const createProposal = (data: any) => AdminAPI.post('/proposals', data)
export const updateProposalStatus = (id: string, status: string) => AdminAPI.put(`/proposals/${id}/status`, { status })
export const deleteProposal = (id: string) => AdminAPI.delete(`/proposals/${id}`)
export const startProjectFromProposal = (id: string, data: any) => AdminAPI.post(`/proposals/${id}/start-project`, data)

// ─── Finance ──────────────────────────────────────────────────────────────────
export const getFinanceRecords = (params?: Record<string, string>) => AdminAPI.get('/finance', { params })
export const getFinanceSummary = (params?: Record<string, string>) => AdminAPI.get('/finance/summary', { params })
export const getFinanceById = (id: string) => AdminAPI.get(`/finance/${id}`)
export const createFinanceRecord = (data: any) => AdminAPI.post('/finance', data)
export const updateFinanceRecord = (id: string, data: any) => AdminAPI.put(`/finance/${id}`, data)
export const deleteFinanceRecord = (id: string) => AdminAPI.delete(`/finance/${id}`)

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getAnalyticsOverview = () => AdminAPI.get('/analytics/overview')
export const getInquiryAnalytics = () => AdminAPI.get('/analytics/inquiries')
export const getVisitorAnalytics = () => AdminAPI.get('/analytics/visitors')
export const getFinanceAnalytics = () => AdminAPI.get('/analytics/finance')
export const getProjectAnalytics = () => AdminAPI.get('/analytics/projects')
export const getHRAnalytics = () => AdminAPI.get('/analytics/hr')
export const getAIInsights = () => AdminAPI.get('/analytics/insights')
export const getRecommendations = () => AdminAPI.get('/analytics/recommendations')

// ─── Project Member Assignment ───────────────────────────────────────────────
export const assignMemberToProject = (projectId: string, employeeId: string, role?: string) => AdminAPI.post(`/projects/${projectId}/assign-member`, { employeeId, role })
export const removeMemberFromProject = (projectId: string, employeeId: string) => AdminAPI.delete(`/projects/${projectId}/remove-member/${employeeId}`)

// ─── Project Tasks ───────────────────────────────────────────────────────────
export const getProjectTasks = (projectId: string) => AdminAPI.get(`/projects/${projectId}/tasks`)
export const createTask = (projectId: string, data: any) => AdminAPI.post(`/projects/${projectId}/tasks`, data)
export const updateTask = (taskId: string, data: any) => AdminAPI.put(`/tasks/${taskId}`, data)
export const deleteTask = (taskId: string) => AdminAPI.delete(`/tasks/${taskId}`)

// ─── Project Finance (Cost Sharing) ──────────────────────────────────────────
export const calculateProjectSharing = (data: any) => AdminAPI.post('/project-finance/calculate', data)
export const getProjectFinance = (projectRef: string) => AdminAPI.get(`/project-finance/${projectRef}`)
export const getProjectAssignments = (projectRef: string) => AdminAPI.get(`/project-finance/${projectRef}/assignments`)
export const notifyProjectTeam = (data: any) => AdminAPI.post('/project-finance/notify', data)
export const markSharePaid = (shareId: string) => AdminAPI.put(`/project-finance/shares/${shareId}/pay`)

// ─── Reports ──────────────────────────────────────────────────────────────────
export const downloadReport = () => AdminAPI.get('/reports/download', { responseType: 'blob' })
export const generateReport = () => AdminAPI.post('/reports/generate')
export const emailReport = () => AdminAPI.post('/reports/email')
export const getEmailLogs = (params?: Record<string, string>) => AdminAPI.get('/reports/email-logs', { params })

// ─── Activity Logs ────────────────────────────────────────────────────────────
export const getActivityLogs = (params?: Record<string, string>) => AdminAPI.get('/logs', { params })

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const getAdminUsers = () => AdminAPI.get('/users')
export const createAdminUser = (data: any) => AdminAPI.post('/users', data)
export const updateAdminUser = (id: string, data: any) => AdminAPI.put(`/users/${id}`, data)
export const deleteAdminUser = (id: string) => AdminAPI.delete(`/users/${id}`)

// ─── WhatsApp CRM ─────────────────────────────────────────────────────────────
export const getWhatsAppStats = () => AdminAPI.get('/whatsapp/stats')
export const getWhatsAppContacts = (params?: Record<string, string>) => AdminAPI.get('/whatsapp/contacts', { params })
export const getWhatsAppContact = (id: string) => AdminAPI.get(`/whatsapp/contacts/${id}`)
export const updateWhatsAppContact = (id: string, data: any) => AdminAPI.put(`/whatsapp/contacts/${id}`, data)
export const deleteWhatsAppContact = (id: string) => AdminAPI.delete(`/whatsapp/contacts/${id}`)
export const convertContactToClient = (id: string, data: any) => AdminAPI.post(`/whatsapp/contacts/${id}/convert`, data)
export const getWhatsAppConversation = (contactId: string, params?: Record<string, string>) => AdminAPI.get(`/whatsapp/conversations/${contactId}`, { params })
export const closeWhatsAppConversation = (id: string) => AdminAPI.put(`/whatsapp/conversations/${id}/close`)
export const sendWhatsAppMessage = (data: { contactId: string; body: string }) => AdminAPI.post('/whatsapp/send', data)
export const sendWhatsAppToPhone = (data: { phone: string; body: string; trigger?: string }) => AdminAPI.post('/whatsapp/send-phone', data)
export const broadcastWhatsApp = (data: { subject?: string; message: string; tags?: string[]; contactIds?: string[] }) => AdminAPI.post('/whatsapp/broadcast', data)
export const getWhatsAppLogs = (params?: Record<string, string>) => AdminAPI.get('/whatsapp/logs', { params })

export default AdminAPI
