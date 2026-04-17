import { Router } from 'express'
import * as hc from '../controllers/healthcare.controller'
import { validate } from '../middlewares/validate.middleware'
import { authenticate, requireRole } from '../middlewares/auth.middleware'
import {
  createPatientSchema,
  createAppointmentSchema,
  createBillingSchema,
  createDenialSchema,
} from '../schemas/healthcare.schema'

const router = Router()

// All healthcare routes are protected
router.use(authenticate)
router.use(requireRole('ADMIN', 'STAFF'))

// Patients
router.post  ('/patients',       validate(createPatientSchema), hc.createPatient)
router.get   ('/patients',       hc.listPatients)
router.get   ('/patients/:id',   hc.getPatient)
router.patch ('/patients/:id',   hc.updatePatient)

// Appointments
router.post  ('/appointments',       validate(createAppointmentSchema), hc.createAppointment)
router.get   ('/appointments',       hc.listAppointments)
router.patch ('/appointments/:id',   hc.updateAppointment)

// Billing
router.post  ('/billing',       validate(createBillingSchema), hc.createBilling)
router.get   ('/billing',       hc.listBillings)
router.get   ('/billing/:id',   hc.getBilling)
router.patch ('/billing/:id',   hc.updateBilling)

// Denials
router.post  ('/denials',       validate(createDenialSchema), hc.createDenial)
router.get   ('/denials',       hc.listDenials)

export default router
