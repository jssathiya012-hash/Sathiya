import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().int().min(1),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.coerce.date().optional(),
  note: z.string().trim().max(500).optional(),
})

export const mockPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  method: z.enum(['CARD', 'UPI', 'NETBANKING']),
  amount: z.coerce.number().int().min(1),
  force: z.enum(['SUCCESS', 'PENDING', 'FAILURE']).optional(),
})
