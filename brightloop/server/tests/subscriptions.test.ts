import { describe, expect, it } from 'vitest'
import { prorateAmount } from '../src/lib/dates.js'
import { canTransitionSubscription } from '../src/lib/subscriptionRules.js'
import { applicableDiscountAmount } from '../src/lib/money.js'
import { billingPeriodKey, mergeUniqueBillingPeriods } from '../src/lib/billingIdempotency.js'

describe('subscription lifecycle', () => {
  const flags = { allowPause: true, allowEarlyClose: true, allowRenew: true }

  it('allows pause and resume for a pausable plan', () => {
    expect(canTransitionSubscription('ACTIVE', 'PAUSED', flags)).toBe(true)
    expect(canTransitionSubscription('PAUSED', 'ACTIVE', flags)).toBe(true)
  })

  it('rejects invalid status jumps', () => {
    expect(canTransitionSubscription('CLOSED', 'PAUSED', flags)).toBe(false)
    expect(canTransitionSubscription('DRAFT', 'ACTIVE', flags)).toBe(false)
  })

  it('honours plan pause and early-close flags', () => {
    expect(canTransitionSubscription('ACTIVE', 'PAUSED', { ...flags, allowPause: false })).toBe(false)
    expect(canTransitionSubscription('ACTIVE', 'CLOSED', { ...flags, allowEarlyClose: false })).toBe(false)
  })
})

describe('proration', () => {
  it('credits unused days and charges new plan usage', () => {
    const result = prorateAmount(
      100000,
      160000,
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-31T00:00:00Z'),
      new Date('2026-01-16T00:00:00Z')
    )
    expect(result.remainingDays).toBe(15)
    expect(result.unusedCredit).toBe(50000)
    expect(result.newPlanCharge).toBe(80000)
    expect(result.amountDueToday).toBe(30000)
  })
})

describe('discount rules', () => {
  const validAt = new Date('2026-05-10T00:00:00Z')
  const rule = {
    type: 'PERCENT' as const,
    value: 10,
    minPurchase: 50000,
    minQuantity: 5,
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-12-31T00:00:00Z'),
    usageLimit: 100,
    usedCount: 2,
  }

  it('applies a valid percentage discount', () => {
    expect(applicableDiscountAmount([rule], 100000, 5, validAt)).toBe(10000)
  })

  it('rejects low quantity, expired, and used-up discounts', () => {
    expect(applicableDiscountAmount([rule], 100000, 4, validAt)).toBe(0)
    expect(applicableDiscountAmount([{ ...rule, endDate: new Date('2026-01-01T00:00:00Z') }], 100000, 5, validAt)).toBe(0)
    expect(applicableDiscountAmount([{ ...rule, usedCount: 100 }], 100000, 5, validAt)).toBe(0)
  })
})

describe('billing idempotency', () => {
  it('runs twice but keeps one invoice period for a subscription', () => {
    const period = new Date('2026-01-01T00:00:00Z')
    const key = billingPeriodKey('subscription-a', period)
    const firstRun = [{ key }]
    const secondRun = mergeUniqueBillingPeriods([...firstRun, { key }])

    expect(secondRun).toHaveLength(1)
    expect(billingPeriodKey('subscription-a', period)).toBe(key)
  })
})
