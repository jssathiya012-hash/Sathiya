import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export interface PageMeta {
  page: number
  limit: number
  total: number
  pageCount: number
}

export const pageMeta = (page: number, limit: number, total: number): PageMeta => ({
  page,
  limit,
  total,
  pageCount: Math.max(1, Math.ceil(total / limit)),
})
