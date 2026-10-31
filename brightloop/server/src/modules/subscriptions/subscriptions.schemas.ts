import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  customerId: z.string().optional(),
  planId: z.string().min(1),
  templateId: z.string().optional(),
  paymentTerms: z.string().default('NET_15'),
  startDate: z.coerce.date().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  variantId: z.string().optional(),
  discountCode: z.string().trim().optional(),
})

export const changePlanSchema = z.object({
  planId: z.string().min(1),
  preview: z.boolean().default(false),
})

export const actionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
})
