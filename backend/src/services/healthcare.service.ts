import * as healthRepo from '../repositories/healthcare.repository'
import { getPagination, buildPaginationMeta } from '../types'
import { Prisma } from '@prisma/client'

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function createPatient(data: Prisma.PatientCreateInput) {
  return healthRepo.createPatient(data)
}

export async function getPatient(id: string) {
  const patient = await healthRepo.findPatientById(id)
  if (!patient) throw new Error('Patient not found')
  return patient
}

export async function listPatients(query: { page?: string; limit?: string; search?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { patients, total } = await healthRepo.listPatients(skip, take, query.search)
  return { patients, meta: buildPaginationMeta(total, page, limit) }
}

export async function updatePatient(id: string, data: Prisma.PatientUpdateInput) {
  const patient = await healthRepo.findPatientById(id)
  if (!patient) throw new Error('Patient not found')
  return healthRepo.updatePatient(id, data)
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function createAppointment(data: Prisma.AppointmentCreateInput) {
  return healthRepo.createAppointment(data)
}

export async function listAppointments(query: { page?: string; limit?: string; patientId?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { appointments, total } = await healthRepo.listAppointments(skip, take, query.patientId)
  return { appointments, meta: buildPaginationMeta(total, page, limit) }
}

export async function updateAppointment(id: string, data: Prisma.AppointmentUpdateInput) {
  return healthRepo.updateAppointment(id, data)
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export async function createBilling(data: Prisma.BillingCreateInput) {
  const billing = await healthRepo.createBilling(data)
  return billing
}

export async function getBilling(id: string) {
  const billing = await healthRepo.findBillingById(id)
  if (!billing) throw new Error('Billing record not found')
  return billing
}

export async function listBillings(query: { page?: string; limit?: string; patientId?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { billings, total } = await healthRepo.listBillings(skip, take, query.patientId)
  return { billings, meta: buildPaginationMeta(total, page, limit) }
}

export async function updateBilling(id: string, data: Prisma.BillingUpdateInput) {
  const billing = await healthRepo.findBillingById(id)
  if (!billing) throw new Error('Billing record not found')
  return healthRepo.updateBilling(id, data)
}

// ─── Denials ──────────────────────────────────────────────────────────────────

export async function createDenial(data: Prisma.DenialCreateInput) {
  return healthRepo.createDenial(data)
}

export async function listDenials(query: { page?: string; limit?: string; billingId?: string }) {
  const { skip, take, page, limit } = getPagination(query)
  const { denials, total } = await healthRepo.listDenials(skip, take, query.billingId)
  return { denials, meta: buildPaginationMeta(total, page, limit) }
}
