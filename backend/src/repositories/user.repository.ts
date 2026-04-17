import prisma from '../config/database'
import { Prisma, Role } from '@prisma/client'
import { hashPassword } from '../utils/bcrypt'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } })
}

export async function createUser(data: { email: string; password: string; name: string; role?: Role }) {
  const hashed = await hashPassword(data.password)
  return prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
}

export async function updateRefreshToken(userId: string, token: string | null) {
  return prisma.user.update({ where: { id: userId }, data: { refreshToken: token } })
}

export async function updateLastLogin(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })
}

export async function listUsers(skip: number, take: number, search?: string) {
  const where: Prisma.UserWhereInput = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
    : {}
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } }),
    prisma.user.count({ where }),
  ])
  return { users, total }
}
