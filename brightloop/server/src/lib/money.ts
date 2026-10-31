export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100)
export const paiseToRupees = (paise: number) => paise / 100
export const percentOf = (amountPaise: number, percent: number) =>
  Math.round(amountPaise * percent / 100)

export interface PriceBreakdownInput {
  basePricePaise: number
  variantExtraPaise: number
  quantity: number
  discountPercent?: number
  discountFixedPaise?: number
  taxPercent: number
}

export interface PriceBreakdown {
  base: number
  variantExtras: number
  discount: number
  tax: number
  total: number
}

// All values use integer paise; rounding happens once for each percentage component.
export const calculatePriceBreakdown = (input: PriceBreakdownInput): PriceBreakdown => {
  const base = input.basePricePaise * input.quantity
  const variantExtras = input.variantExtraPaise * input.quantity
  const subtotal = base + variantExtras
  const percentDiscount = percentOf(subtotal, input.discountPercent ?? 0)
  const discount = Math.min(subtotal, percentDiscount + (input.discountFixedPaise ?? 0))
  const taxable = subtotal - discount
  const tax = percentOf(taxable, input.taxPercent)
  return { base, variantExtras, discount, tax, total: taxable + tax }
}

export interface DiscountRule {
  type: 'FIXED' | 'PERCENT'
  value: number
  minPurchase: number
  minQuantity: number
  startDate: Date
  endDate: Date
  usageLimit: number
  usedCount: number
}

// Returns zero discount for rules that are expired, not used yet, or no longer eligible.
export const applicableDiscountAmount = (
  rules: DiscountRule[],
  subtotal: number,
  quantity: number,
  now = new Date()
) => {
  const applicable = rules.filter(rule =>
    rule.usedCount < rule.usageLimit &&
    rule.startDate <= now &&
    rule.endDate >= now &&
    subtotal >= rule.minPurchase &&
    quantity >= rule.minQuantity
  )
  if (!applicable.length) return 0
  return Math.max(...applicable.map(rule =>
    rule.type === 'PERCENT'
      ? Math.min(subtotal, percentOf(subtotal, rule.value))
      : Math.min(subtotal, rule.value)
  ))
}
