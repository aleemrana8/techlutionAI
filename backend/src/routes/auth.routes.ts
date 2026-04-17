import { Router } from 'express'
import * as authCtrl from '../controllers/auth.controller'
import { validate } from '../middlewares/validate.middleware'
import { authenticate } from '../middlewares/auth.middleware'
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth.schema'

const router = Router()

router.post('/register', validate(registerSchema), authCtrl.register)
router.post('/login',    validate(loginSchema),    authCtrl.login)
router.post('/refresh',  validate(refreshSchema),  authCtrl.refresh)
router.post('/logout',   authenticate,             authCtrl.logout)
router.get ('/me',       authenticate,             authCtrl.profile)

export default router
