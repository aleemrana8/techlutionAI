import { Request } from 'express'
import { Role } from '@prisma/client'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: Role
  }
}

export interface PaginationQuery {
  page?: string
  limit?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  [key: string]: unknown
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function getPagination(query: PaginationQuery): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
