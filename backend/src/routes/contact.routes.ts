import { Router } from 'express'
import * as contactCtrl from '../controllers/contact.controller'
import { validate } from '../middlewares/validate.middleware'
import { authenticate, requireRole } from '../middlewares/auth.middleware'
import { contactSchema, projectSchema } from '../schemas/contact.schema'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

// Public routes (frontend forms) — accept up to 5 file attachments
router.post('/', upload.array('attachments', 5), validate(contactSchema), contactCtrl.submitContact)
router.post('/project', upload.array('attachments', 5), validate(projectSchema), contactCtrl.submitProjectRequest)

// Admin routes
router.get ('/',      authenticate, requireRole('ADMIN', 'STAFF'), contactCtrl.listLeads)
router.patch('/:id',  authenticate, requireRole('ADMIN', 'STAFF'), contactCtrl.updateLeadStatus)

export default router
