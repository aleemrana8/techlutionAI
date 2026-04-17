import { z } from 'zod'

export const createPatientSchema = z.object({
  firstName:           z.string().min(1).max(100),
  lastName:            z.string().min(1).max(100),
  dateOfBirth:         z.string().datetime(),
  gender:              z.string().min(1),
  phone:               z.string().optional(),
  email:               z.string().email().optional(),
  address:             z.string().optional(),
  city:                z.string().optional(),
  state:               z.string().optional(),
  zipCode:             z.string().optional(),
  medicalRecordNumber: z.string().min(1),
  insuranceId:         z.string().optional(),
  insuranceProvider:   z.string().optional(),
  groupNumber:         z.string().optional(),
  memberId:            z.string().optional(),
  notes:               z.string().optional(),
})

export const createAppointmentSchema = z.object({
  patientId:       z.string().cuid(),
  appointmentDate: z.string().datetime(),
  appointmentTime: z.string(),
  type:            z.string().min(1),
  provider:        z.string().optional(),
  location:        z.string().optional(),
  reasonForVisit:  z.string().optional(),
  notes:           z.string().optional(),
})

export const createBillingSchema = z.object({
  patientId:       z.string().cuid(),
  appointmentId:   z.string().cuid().optional(),
  dateOfService:   z.string().datetime(),
  chargeAmount:    z.number().positive(),
  icdCodes:        z.array(z.string()).min(1),
  cptCodes:        z.array(z.string()).min(1),
  insuranceId:     z.string().optional(),
  claimNumber:     z.string().optional(),
  notes:           z.string().optional(),
})

export const createDenialSchema = z.object({
  billingId:   z.string().cuid(),
  denialCode:  z.string().min(1),
  reason:      z.string().min(1),
  denialDate:  z.string().datetime(),
  appealNotes: z.string().optional(),
})
