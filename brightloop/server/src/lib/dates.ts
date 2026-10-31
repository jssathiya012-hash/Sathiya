import { addDays, addMonths, addWeeks, addYears, startOfDay, differenceInCalendarDays } from 'date-fns'
import type { BillingPeriod } from '@prisma/client'

export const addBillingPeriod = (date: Date, period: BillingPeriod): Date => {
  if (period === 'DAILY') return addDays(date, 1)
  if (period === 'WEEKLY') return addWeeks(date, 1)
  if (period === 'YEARLY') return addYears(date, 1)
  return addMonths(date, 1)
}

export const today = () => startOfDay(new Date())
export const calendarDaysBetween = (start: Date, end: Date) =>
  differenceInCalendarDays(end, start)

export const prorateAmount = (
  oldPlanPricePaise: number,
  newPlanPricePaise: number,
  cycleStart: Date,
  cycleEnd: Date,
  now = new Date()
) => {
  const cycleDays = Math.max(1, calendarDaysBetween(cycleStart, cycleEnd))
  const usedDays = Math.min(cycleDays, Math.max(0, calendarDaysBetween(cycleStart, now)))
  const remainingDays = cycleDays - usedDays
  const unusedCredit = Math.round(oldPlanPricePaise * remainingDays / cycleDays)
  const newPlanCharge = Math.round(newPlanPricePaise * remainingDays / cycleDays)
  return {
    cycleDays,
    remainingDays,
    unusedCredit,
    newPlanCharge,
    amountDueToday: newPlanCharge - unusedCredit,
  }
}
