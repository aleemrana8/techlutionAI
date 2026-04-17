import * as userRepo from '../repositories/user.repository'
import { comparePassword } from '../utils/bcrypt'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { updateRefreshToken, updateLastLogin } from '../repositories/user.repository'
import { Role } from '@prisma/client'

export interface RegisterInput {
  email: string
  password: string
  name: string
  role?: Role
}

export async function register(input: RegisterInput) {
  const existing = await userRepo.findUserByEmail(input.email)
  if (existing) throw new Error('Email already registered')

  const user = await userRepo.createUser(input)
  const accessToken  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role })
  await updateRefreshToken(user.id, refreshToken)

  return { user, accessToken, refreshToken }
}

export async function login(email: string, password: string) {
  const user = await userRepo.findUserByEmail(email)
  if (!user || !user.isActive) throw new Error('Invalid credentials')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const accessToken  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role })
  await updateRefreshToken(user.id, refreshToken)
  await updateLastLogin(user.id)

  const { password: _pw, refreshToken: _rt, ...safeUser } = user
  return { user: safeUser, accessToken, refreshToken }
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token)
  const user = await userRepo.findUserByEmail(payload.email)
  if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

  const accessToken  = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const newRefresh   = signRefreshToken({ sub: user.id, email: user.email, role: user.role })
  await updateRefreshToken(user.id, newRefresh)

  return { accessToken, refreshToken: newRefresh }
}

export async function logout(userId: string) {
  await updateRefreshToken(userId, null)
}

export async function getProfile(userId: string) {
  const user = await userRepo.findUserById(userId)
  if (!user) throw new Error('User not found')
  return user
}
