import { describe, expect, it, vi } from 'vitest'
import { isStrongPassword } from '../src/lib/password.js'
import { canCreateDiscount } from '../src/lib/permissions.js'
import { ownedInvoiceWhere, findOwnedInvoiceById } from '../src/lib/ownership.js'
import { Role } from '@prisma/client'

describe('password rules', () => {
  it('accepts a password with every required character type', () => {
    expect(isStrongPassword('Brightloop!1')).toBe(true)
  })

  it('rejects short or incomplete passwords', () => {
    expect(isStrongPassword('demo123')).toBe(false)
    expect(isStrongPassword('Demo123456')).toBe(false)
  })
})

describe('role permissions', () => {
  it('allows only an admin to create discounts', () => {
    expect(canCreateDiscount(Role.ADMIN)).toBe(true)
    expect(canCreateDiscount(Role.STAFF)).toBe(false)
    expect(canCreateDiscount(Role.CUSTOMER)).toBe(false)
  })
})

describe('customer invoice ownership', () => {
  it('filters invoice lookup by both customer and invoice id', async () => {
    const findFirst = vi.fn().mockResolvedValue(null)
    const db = { invoice: { findFirst } } as any

    const result = await findOwnedInvoiceById(db, 'customer-a', 'invoice-b')

    expect(result).toBeNull()
    expect(findFirst).toHaveBeenCalledWith({
      where: ownedInvoiceWhere('customer-a', 'invoice-b'),
    })
    expect(ownedInvoiceWhere('customer-a', 'invoice-b')).toEqual({
      id: 'invoice-b',
      customerId: 'customer-a',
    })
  })

  it('returns no cross-customer invoice when the id belongs to customer b', async () => {
    const findFirst = vi.fn(async ({ where }: { where: { id: string; customerId: string } }) =>
      where.customerId === 'customer-b' && where.id === 'invoice-b'
        ? { id: 'invoice-b', customerId: 'customer-b', total: 59000 }
        : null
    )
    const db = { invoice: { findFirst } } as any

    expect(await findOwnedInvoiceById(db, 'customer-a', 'invoice-b')).toBeNull()
  })
})
