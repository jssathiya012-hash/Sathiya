import type { BillingPeriod, SubscriptionStatus } from '@prisma/client'

export const canTransitionSubscription = (
  from: SubscriptionStatus,
  to: SubscriptionStatus,
  flags: { allowPause: boolean; allowEarlyClose: boolean; allowRenew: boolean }
) => {
  if (from === 'ACTIVE' && to === 'PAUSED') return flags.allowPause
  if (from === 'PAUSED' && to === 'ACTIVE') return flags.allowPause
  if (to === 'CLOSED') return from !== 'CLOSED' && flags.allowEarlyClose
  if (from === 'CLOSED' && to === 'ACTIVE') return flags.allowRenew
  return false
}

export const subscriptionExpiryForPeriod = (start: Date, period: BillingPeriod) => {
  const end = new Date(start)
  if (period === 'DAILY') end.setDate(end.getDate() + 1)
  if (period === 'WEEKLY') end.setDate(end.getDate() + 7)
  if (period === 'MONTHLY') end.setMonth(end.getMonth() + 1)
  if (period === 'YEARLY') end.setFullYear(end.getFullYear() + 1)
  return end
}
