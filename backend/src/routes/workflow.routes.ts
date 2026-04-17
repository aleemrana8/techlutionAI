import { Router } from 'express'
import * as wfCtrl from '../controllers/workflow.controller'
import { authenticate, requireRole } from '../middlewares/auth.middleware'

const router = Router()

// Webhook endpoint — public (secured via workflow ID)
router.post('/webhook/:id', wfCtrl.handleWebhook)

// Protected routes
router.use(authenticate)

router.post  ('/',           requireRole('ADMIN', 'STAFF'), wfCtrl.createWorkflow)
router.get   ('/',           wfCtrl.listWorkflows)
router.get   ('/:id',        wfCtrl.getWorkflow)
router.patch ('/:id',        requireRole('ADMIN', 'STAFF'), wfCtrl.updateWorkflow)
router.post  ('/:id/trigger',wfCtrl.triggerWorkflow)

export default router
