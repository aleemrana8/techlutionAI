import { Router } from 'express'
import * as projectCtrl from '../controllers/project.controller'
import { validate } from '../middlewares/validate.middleware'
import { authenticate, requireRole } from '../middlewares/auth.middleware'
import { createProjectSchema, updateProjectSchema, generateProjectSchema } from '../schemas/project.schema'

const router = Router()

// Public routes
router.get('/', projectCtrl.listProjects)

// AI generate — must be before /:id to prevent "generate" matching as param
router.post(
  '/generate',
  authenticate,
  validate(generateProjectSchema),
  projectCtrl.generateProject,
)

// Public detail route (accepts cuid id or slug)
router.get('/:id', projectCtrl.getProject)

// Protected routes
router.post(
  '/',
  authenticate,
  validate(createProjectSchema),
  projectCtrl.createProject,
)

router.patch(
  '/:id',
  authenticate,
  validate(updateProjectSchema),
  projectCtrl.updateProject,
)

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  projectCtrl.deleteProject,
)

export default router
