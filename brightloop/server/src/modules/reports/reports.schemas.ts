import { z } from 'zod'
import { InvoiceStatus, SubscriptionStatus } from '@prisma/client'

export const reportFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  planId: z.string().optional(),
  productId: z.string().optional(),
  status: z.string().optional(),
  customerId: z.string().optional(),
})

export const csvExportSchema = reportFilterSchema.extend({
  report: z.enum(['payments', 'invoices', 'subscriptions', 'overdue']).default('payments'),
})
