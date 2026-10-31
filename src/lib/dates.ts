import { differenceInCalendarDays, format } from 'date-fns'

export const formatDate = (value: string | Date) => format(new Date(value), 'dd MMM yyyy')

export const daysBetween = (from: string | Date, to: string | Date) =>
  differenceInCalendarDays(new Date(to), new Date(from))

export const countdownText = (value: string | Date) => {
  const days = differenceInCalendarDays(new Date(value), new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day remaining'
  return `${days} days remaining`
}