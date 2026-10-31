import { z } from 'zod'
import { BillingPeriod, DiscountAppliesTo, DiscountType } from '@prisma/client'

const dateSchema = z.coerce.date()

export const productSchema = z.object({
  name: z.string().trim().min(2),
  type: z.string().trim().min(2),
  salesPrice: z.coerce.number().int().min(0),
  costPrice: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().optional(),
  isActive: z.boolean().default(true),
})

export const variantSchema = z.object({
  productId: z.string().min(1),
  attribute: z.string().trim().min(1),
  value: z.string().trim().min(1),
  extraPrice: z.coerce.number().int().default(0),
})

export const planSchema = z.object({
  name: z.string().trim().min(2),
  productId: z.string().min(1),
  price: z.coerce.number().int().min(0),
  billingPeriod: z.nativeEnum(BillingPeriod),
  minQuantity: z.coerce.number().int().min(1),
  availableFrom: dateSchema.default(() => new Date()),
  availableTo: dateSchema,
  autoCloseAtEnd: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenew: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

export const taxSchema = z.object({
  name: z.string().trim().min(2),
  ratePercent: z.coerce.number().int().min(0).max(100),
  isActive: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
})

export const discountSchema = z.object({
  name: z.string().trim().min(2),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.number().int().min(0),
  minPurchase: z.coerce.number().int().min(0).default(0),
  minQuantity: z.coerce.number().int().min(1).default(1),
  startDate: dateSchema,
  endDate: dateSchema,
  usageLimit: z.coerce.number().int().min(1),
  appliesTo: z.nativeEnum(DiscountAppliesTo),
  productIds: z.array(z.string()).default([]),
})

export const templateSchema = z.object({
  name: z.string().trim().min(2),
  validityDays: z.coerce.number().int().min(1).max(365),
  planId: z.string().min(1),
  lines: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional().nullable(),
    quantity: z.coerce.number().int().min(1),
  })).min(1),
})
