import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import ProjectsPage from '../pages/ProjectsPage'
import ProjectDetails from '../pages/ProjectDetails'
import ContactPage from '../pages/ContactPage'

// Admin
import { AuthProvider } from '../admin/context/AuthContext'
import ProtectedRoute from '../admin/components/ProtectedRoute'
import AdminLogin from '../admin/pages/AdminLogin'
import AdminLayout from '../admin/components/AdminLayout'
import Dashboard from '../admin/pages/Dashboard'
import Visitors from '../admin/pages/Visitors'
import Clients from '../admin/pages/Clients'
import HRManagement from '../admin/pages/HRManagement'
import FinanceDashboard from '../admin/pages/FinanceDashboard'
import ProjectsBoard from '../admin/pages/ProjectsBoard'
import Leads from '../admin/pages/Leads'
import SettingsPage from '../admin/pages/Settings'
import ActivityLogs from '../admin/pages/ActivityLogs'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AuthProvider><AdminLogin /></AuthProvider>} />
      <Route
        path="/admin"
        element={
          <AuthProvider>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </AuthProvider>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="clients" element={<Clients />} />
        <Route path="hr" element={<HRManagement />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="projects" element={<ProjectsBoard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
