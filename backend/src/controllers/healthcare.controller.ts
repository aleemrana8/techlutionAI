import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import * as healthService from '../services/healthcare.service'
import { sendSuccess } from '../utils/response'

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function createPatient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const patient = await healthService.createPatient({
      ...req.body,
      dateOfBirth: new Date(req.body.dateOfBirth),
    })
    sendSuccess(res, patient, 'Patient created', 201)
  } catch (err) { next(err) }
}

export async function getPatient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const patient = await healthService.getPatient(req.params.id)
    sendSuccess(res, patient)
  } catch (err) { next(err) }
}

export async function listPatients(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await healthService.listPatients(req.query as Record<string, string>)
    sendSuccess(res, result.patients, 'Patients retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updatePatient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const patient = await healthService.updatePatient(req.params.id, req.body)
    sendSuccess(res, patient, 'Patient updated')
  } catch (err) { next(err) }
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function createAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const appt = await healthService.createAppointment({
      ...req.body,
      appointmentDate: new Date(req.body.appointmentDate),
      patient: { connect: { id: req.body.patientId } },
    })
    sendSuccess(res, appt, 'Appointment created', 201)
  } catch (err) { next(err) }
}

export async function listAppointments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await healthService.listAppointments(req.query as Record<string, string>)
    sendSuccess(res, result.appointments, 'Appointments retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updateAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const appt = await healthService.updateAppointment(req.params.id, req.body)
    sendSuccess(res, appt, 'Appointment updated')
  } catch (err) { next(err) }
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export async function createBilling(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { chargeAmount, patientId, appointmentId, dateOfService, icdCodes, cptCodes, insuranceId, claimNumber, notes } = req.body
    const billing = await healthService.createBilling({
      chargeAmount,
      balanceDue: chargeAmount,
      dateOfService: new Date(dateOfService),
      icdCodes,
      cptCodes,
      insuranceId,
      claimNumber,
      notes,
      patient: { connect: { id: patientId } },
      ...(appointmentId ? { appointment: { connect: { id: appointmentId } } } : {}),
    })
    sendSuccess(res, billing, 'Billing record created', 201)
  } catch (err) { next(err) }
}

export async function getBilling(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const billing = await healthService.getBilling(req.params.id)
    sendSuccess(res, billing)
  } catch (err) { next(err) }
}

export async function listBillings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await healthService.listBillings(req.query as Record<string, string>)
    sendSuccess(res, result.billings, 'Billings retrieved', 200, result.meta)
  } catch (err) { next(err) }
}

export async function updateBilling(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const billing = await healthService.updateBilling(req.params.id, req.body)
    sendSuccess(res, billing, 'Billing updated')
  } catch (err) { next(err) }
}

// ─── Denials ──────────────────────────────────────────────────────────────────

export async function createDenial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const denial = await healthService.createDenial({
      ...req.body,
      denialDate: new Date(req.body.denialDate),
      billing: { connect: { id: req.body.billingId } },
    })
    sendSuccess(res, denial, 'Denial record created', 201)
  } catch (err) { next(err) }
}

export async function listDenials(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await healthService.listDenials(req.query as Record<string, string>)
    sendSuccess(res, result.denials, 'Denials retrieved', 200, result.meta)
  } catch (err) { next(err) }
}
