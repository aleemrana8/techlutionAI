import { Router } from 'express'
import { requireAdmin, requirePermission, requireRoles } from '../middlewares/admin.middleware'
import * as dashboardCtrl from '../controllers/dashboard.controller'
import * as visitorCtrl from '../controllers/visitor.controller'
import * as leadCtrl from '../controllers/lead.controller'
import * as clientCtrl from '../controllers/client.controller'
import * as employeeCtrl from '../controllers/employee.controller'
import * as financeCtrl from '../controllers/finance.controller'
import * as analyticsCtrl from '../controllers/analytics.controller'
import * as adminUserCtrl from '../controllers/adminUser.controller'

const router = Router()

// ─── Public admin auth (no token required) ────────────────────────────────────
router.post('/login', adminUserCtrl.login)

// All routes below require authentication
router.use(requireAdmin)

// ─── Dashboard Summary ────────────────────────────────────────────────────────
router.get('/dashboard', adminUserCtrl.dashboardSummary)
router.get('/dashboard/summary', adminUserCtrl.dashboardSummary)

// ─── Admin Users (SUPER_ADMIN only) ──────────────────────────────────────────
router.get('/users', requireRoles('SUPER_ADMIN', 'ADMIN'), adminUserCtrl.list)
router.post('/users', requireRoles('SUPER_ADMIN'), adminUserCtrl.create)
router.put('/users/:id', requireRoles('SUPER_ADMIN'), adminUserCtrl.update)
router.delete('/users/:id', requireRoles('SUPER_ADMIN'), adminUserCtrl.remove)

// ─── Activity Logs (ADMIN only) ──────────────────────────────────────────────
router.get('/logs', requirePermission('logs'), adminUserCtrl.getLogs)

// ─── Visitors ─────────────────────────────────────────────────────────────────
router.get('/visitors', requirePermission('visitors', 'read'), visitorCtrl.list)
router.get('/visitors/stats', requirePermission('visitors', 'read'), visitorCtrl.stats)
router.post('/visitors', requirePermission('visitors', 'write'), visitorCtrl.create)

// ─── Leads ────────────────────────────────────────────────────────────────────
router.get('/leads', requirePermission('leads', 'read'), leadCtrl.list)
router.get('/leads/stats', requirePermission('leads', 'read'), leadCtrl.stats)
router.get('/leads/:id', requirePermission('leads', 'read'), leadCtrl.getById)
router.post('/leads', requirePermission('leads', 'write'), leadCtrl.create)
router.put('/leads/:id', requirePermission('leads', 'write'), leadCtrl.update)
router.delete('/leads/:id', requirePermission('leads', 'write'), leadCtrl.remove)

// ─── Clients ──────────────────────────────────────────────────────────────────
router.get('/clients', requirePermission('clients', 'read'), clientCtrl.list)
router.get('/clients/stats', requirePermission('clients', 'read'), clientCtrl.stats)
router.get('/clients/:id', requirePermission('clients', 'read'), clientCtrl.getById)
router.post('/clients', requirePermission('clients', 'write'), clientCtrl.create)
router.put('/clients/:id', requirePermission('clients', 'write'), clientCtrl.update)
router.delete('/clients/:id', requirePermission('clients', 'write'), clientCtrl.remove)

// ─── Employees (HR) ──────────────────────────────────────────────────────────
router.get('/employees', requirePermission('employees', 'read'), employeeCtrl.list)
router.get('/employees/stats', requirePermission('employees', 'read'), employeeCtrl.stats)
router.get('/employees/:id', requirePermission('employees', 'read'), employeeCtrl.getById)
router.post('/employees', requirePermission('employees', 'write'), employeeCtrl.create)
router.put('/employees/:id', requirePermission('employees', 'write'), employeeCtrl.update)
router.delete('/employees/:id', requirePermission('employees', 'write'), employeeCtrl.remove)

// ─── Finance ──────────────────────────────────────────────────────────────────
router.get('/finance', requirePermission('finance', 'read'), financeCtrl.list)
router.get('/finance/summary', requirePermission('finance', 'read'), financeCtrl.summary)
router.get('/finance/:id', requirePermission('finance', 'read'), financeCtrl.getById)
router.post('/finance', requirePermission('finance', 'write'), financeCtrl.create)
router.put('/finance/:id', requirePermission('finance', 'write'), financeCtrl.update)
router.delete('/finance/:id', requirePermission('finance', 'write'), financeCtrl.remove)

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics/overview', requirePermission('analytics'), analyticsCtrl.overview)
router.get('/analytics/leads', requirePermission('analytics'), analyticsCtrl.leadAnalytics)
router.get('/analytics/visitors', requirePermission('analytics'), analyticsCtrl.visitorAnalytics)
router.get('/analytics/finance', requirePermission('analytics'), analyticsCtrl.financeAnalytics)
router.get('/analytics/projects', requirePermission('analytics'), analyticsCtrl.projectAnalytics)
router.get('/analytics/hr', requirePermission('analytics'), analyticsCtrl.hrAnalytics)

export default router
