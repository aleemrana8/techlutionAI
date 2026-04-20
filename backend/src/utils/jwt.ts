import jwt, { SignOptions } from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = (process.env.JWT_SECRET ?? '').trim()
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d').trim() as string & { __brand: 'StringValue' }
  return jwt.sign(payload, secret, { expiresIn } as SignOptions)
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = (process.env.JWT_REFRESH_SECRET ?? '').trim()
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d').trim() as string & { __brand: 'StringValue' }
  return jwt.sign(payload, secret, { expiresIn } as SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, (process.env.JWT_SECRET ?? '').trim()) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, (process.env.JWT_REFRESH_SECRET ?? '').trim()) as JwtPayload
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
