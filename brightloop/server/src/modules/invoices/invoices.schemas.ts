import { z } from 'zod'

export const invoiceListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED', 'OVERDUE']).optional(),
  search: z.string().trim().optional(),
  customerId: z.string().optional(),
})
