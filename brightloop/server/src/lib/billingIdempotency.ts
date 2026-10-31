export const billingPeriodKey = (subscriptionId: string, periodStart: Date) =>
  `${subscriptionId}:${periodStart.toISOString().slice(0, 10)}`

// The same subscription and period date must produce the same idempotency key.
export const mergeUniqueBillingPeriods = (
  keysAndInvoices: { key: string }[]
) => Array.from(new Map(keysAndInvoices.map(item => [item.key, item])).values())
