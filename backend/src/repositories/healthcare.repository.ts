import prisma from '../config/database'
import { Prisma } from '@prisma/client'

export async function createPatient(data: Prisma.PatientCreateInput) {
  return prisma.patient.create({ data })
}

export async function findPatientById(id: string) {
  return prisma.patient.findUnique({ where: { id }, include: { appointments: true, billings: true } })
}

export async function listPatients(skip: number, take: number, search?: string) {
  const where: Prisma.PatientWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}
  const [patients, total] = await prisma.$transaction([
    prisma.patient.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.patient.count({ where }),
  ])
  return { patients, total }
}

export async function updatePatient(id: string, data: Prisma.PatientUpdateInput) {
  return prisma.patient.update({ where: { id }, data })
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function createAppointment(data: Prisma.AppointmentCreateInput) {
  return prisma.appointment.create({ data, include: { patient: true } })
}

export async function listAppointments(skip: number, take: number, patientId?: string) {
  const where: Prisma.AppointmentWhereInput = patientId ? { patientId } : {}
  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({ where, skip, take, orderBy: { appointmentDate: 'asc' }, include: { patient: true } }),
    prisma.appointment.count({ where }),
  ])
  return { appointments, total }
}

export async function updateAppointment(id: string, data: Prisma.AppointmentUpdateInput) {
  return prisma.appointment.update({ where: { id }, data, include: { patient: true } })
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export async function createBilling(data: Prisma.BillingCreateInput) {
  return prisma.billing.create({ data, include: { patient: true, appointment: true, denials: true } })
}

export async function findBillingById(id: string) {
  return prisma.billing.findUnique({ where: { id }, include: { patient: true, appointment: true, denials: true } })
}

export async function listBillings(skip: number, take: number, patientId?: string) {
  const where: Prisma.BillingWhereInput = patientId ? { patientId } : {}
  const [billings, total] = await prisma.$transaction([
    prisma.billing.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { patient: true, denials: true } }),
    prisma.billing.count({ where }),
  ])
  return { billings, total }
}

export async function updateBilling(id: string, data: Prisma.BillingUpdateInput) {
  return prisma.billing.update({ where: { id }, data, include: { patient: true, denials: true } })
}

// ─── Denials ──────────────────────────────────────────────────────────────────

export async function createDenial(data: Prisma.DenialCreateInput) {
  return prisma.denial.create({ data, include: { billing: true } })
}

export async function listDenials(skip: number, take: number, billingId?: string) {
  const where: Prisma.DenialWhereInput = billingId ? { billingId } : {}
  const [denials, total] = await prisma.$transaction([
    prisma.denial.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { billing: true } }),
    prisma.denial.count({ where }),
  ])
  return { denials, total }
}
