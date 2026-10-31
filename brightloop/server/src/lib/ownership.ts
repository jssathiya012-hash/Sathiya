import type { PrismaClient } from '@prisma/client'

export const ownedInvoiceWhere = (customerId: string, invoiceId: string) => ({
  id: invoiceId,
  customerId,
})

// This helper always combines invoice id with the logged-in customer id.
export const findOwnedInvoiceById = async (
  db: PrismaClient,
  customerId: string,
  invoiceId: string
) => db.invoice.findFirst({
  where: ownedInvoiceWhere(customerId, invoiceId),
})
