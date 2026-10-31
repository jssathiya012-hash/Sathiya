import { Router } from 'express'
import { performance } from 'node:perf_hooks'
import { InvoiceStatus, PaymentStatus, Role, SubscriptionStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateQuery } from '../../middleware/validate.js'
import { reportFilterSchema, csvExportSchema } from './reports.schemas.js'

export const reportsRouter = Router()
reportsRouter.use(authRequired, requireRole(Role.ADMIN, Role.STAFF))

const csv = (value: unknown) => {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

const dateWhere = (from?: Date, to?: Date) => {
  if (!from && !to) return {}
  return { gte: from, ...(to ? { lte: to } : {}) }
}

const buildInvoiceWhere = (query: z.infer<typeof reportFilterSchema>) => {
  const where: any = {}
  if (query.from || query.to) where.invoiceDate = dateWhere(query.from, query.to)
  if (query.customerId) where.customerId = query.customerId
  if (query.status && Object.values(InvoiceStatus).includes(query.status as InvoiceStatus)) {
    where.status = query.status
  }
  if (query.planId || query.productId) {
    where.subscription = {
      ...(query.planId ? { planId: query.planId } : {}),
      ...(query.productId ? { plan: { productId: query.productId } } : {}),
    }
  }
  return where
}

const buildSubscriptionWhere = (query: z.infer<typeof reportFilterSchema>) => {
  const where: any = {}
  if (query.customerId) where.customerId = query.customerId
  if (query.planId) where.planId = query.planId
  if (query.status && Object.values(SubscriptionStatus).includes(query.status as SubscriptionStatus)) {
    where.status = query.status
  }
  if (query.productId) where.plan = { productId: query.productId }
  return where
}

reportsRouter.get('/summary', validateQuery(reportFilterSchema), async (req, res, next) => {
  try {
    const started = performance.now()
    const query = req.query as unknown as z.infer<typeof reportFilterSchema>
    const invoiceWhere = buildInvoiceWhere(query)
    const subscriptionWhere = buildSubscriptionWhere(query)
    const paymentWhere: any = { status: PaymentStatus.SUCCESS }
    if (query.from || query.to) paymentWhere.paidAt = dateWhere(query.from, query.to)
    if (query.customerId) paymentWhere.customerId = query.customerId

    const [
      activeSubscriptions,
      recurringPlans,
      revenueCollected,
      unpaidInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.subscription.count({ where: { ...subscriptionWhere, status: SubscriptionStatus.ACTIVE } }),
      prisma.subscription.findMany({
        where: { ...subscriptionWhere, status: SubscriptionStatus.ACTIVE },
        select: { plan: { select: { price: true, billingPeriod: true } } },
      }),
      prisma.payment.aggregate({ where: paymentWhere, _sum: { amount: true } }),
      prisma.invoice.aggregate({
        where: { ...invoiceWhere, status: { in: [InvoiceStatus.CONFIRMED, InvoiceStatus.DRAFT] } },
        _sum: { total: true, amountPaid: true },
      }),
      prisma.invoice.findMany({
        where: { ...invoiceWhere, status: InvoiceStatus.CONFIRMED, dueDate: { lt: new Date() } },
        select: { total: true, amountPaid: true },
      }),
    ])

    const mrr = recurringPlans.reduce((sum, item) => {
      const period = item.plan.billingPeriod
      const price = item.plan.price
      if (period === 'YEARLY') return sum + Math.round(price / 12)
      if (period === 'WEEKLY') return sum + Math.round(price * 52 / 12)
      if (period === 'DAILY') return sum + Math.round(price * 365 / 12)
      return sum + price
    }, 0)
    const outstanding = Math.max(0, (unpaidInvoices._sum.total ?? 0) - (unpaidInvoices._sum.amountPaid ?? 0))
    const overdueCount = overdueInvoices.filter(invoice => invoice.amountPaid < invoice.total).length
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + Math.max(0, invoice.total - invoice.amountPaid), 0)

    console.log(`Reports summary endpoint: ${Math.round(performance.now() - started)} ms`)
    res.json({
      activeSubscriptions,
      mrr,
      revenueCollected: revenueCollected._sum.amount ?? 0,
      outstanding,
      overdueCount,
      overdueAmount,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) { next(error) }
})

reportsRouter.get('/revenue-by-month', validateQuery(reportFilterSchema), async (req, res, next) => {
  try {
    const started = performance.now()
    const query = req.query as unknown as z.infer<typeof reportFilterSchema>
    const where: any = { status: PaymentStatus.SUCCESS }
    if (query.from || query.to) where.paidAt = dateWhere(query.from, query.to)
    if (query.customerId) where.customerId = query.customerId
    const payments = await prisma.payment.findMany({
      where,
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })
    const totals = new Map<string, number>()
    for (const payment of payments) {
      const month = payment.paidAt.toISOString().slice(0, 7)
      totals.set(month, (totals.get(month) ?? 0) + payment.amount)
    }
    const items = Array.from(totals.entries()).map(([month, amount]) => ({ month, amount }))
    console.log(`Revenue report endpoint: ${Math.round(performance.now() - started)} ms`)
    res.json({ items })
  } catch (error) { next(error) }
})

reportsRouter.get('/payments', validateQuery(reportFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(PaymentStatus).optional(),
})), async (req, res, next) => {
  try {
    const query = req.query as any
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)
    const where: any = {}
    if (query.from || query.to) where.paidAt = dateWhere(query.from, query.to)
    if (query.customerId) where.customerId = query.customerId
    if (query.status) where.status = query.status
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { customer: { select: { id: true, name: true, email: true } }, invoice: { select: { id: true, number: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paidAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

reportsRouter.get('/overdue', validateQuery(reportFilterSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})), async (req, res, next) => {
  try {
    const started = performance.now()
    const query = req.query as any
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)
    const where = {
      ...buildInvoiceWhere(query),
      status: InvoiceStatus.CONFIRMED,
      dueDate: { lt: new Date() },
    }
    const all = await prisma.invoice.findMany({
      where,
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { dueDate: 'asc' },
    })
    const items = all.filter(invoice => invoice.amountPaid < invoice.total)
    const paged = items.slice((page - 1) * limit, page * limit)
    console.log(`Overdue report endpoint: ${Math.round(performance.now() - started)} ms`)
    res.json({ items: paged, page: { page, limit, total: items.length, pageCount: Math.ceil(items.length / limit) } })
  } catch (error) { next(error) }
})

reportsRouter.get('/subscriptions-by-status', validateQuery(reportFilterSchema), async (req, res, next) => {
  try {
    const query = req.query as unknown as z.infer<typeof reportFilterSchema>
    const groups = await prisma.subscription.groupBy({
      by: ['status'],
      where: buildSubscriptionWhere(query),
      _count: { _all: true },
    })
    res.json({ items: groups.map(group => ({ status: group.status, count: group._count._all })) })
  } catch (error) { next(error) }
})

reportsRouter.get('/export.csv', validateQuery(csvExportSchema), async (req, res, next) => {
  try {
    const query = req.query as unknown as z.infer<typeof csvExportSchema>
    let rows: unknown[][] = []
    let header: string[] = []

    if (query.report === 'payments') {
      const where: any = {}
      if (query.from || query.to) where.paidAt = dateWhere(query.from, query.to)
      if (query.customerId) where.customerId = query.customerId
      const items = await prisma.payment.findMany({ where, include: { customer: true, invoice: true }, take: 10000, orderBy: { paidAt: 'desc' } })
      header = ['Reference', 'Customer', 'Invoice', 'Method', 'Amount Paise', 'Status', 'Date']
      rows = items.map(item => [item.reference, item.customer.name, item.invoice.number, item.method, item.amount, item.status, item.paidAt.toISOString()])
    } else if (query.report === 'invoices') {
      const items = await prisma.invoice.findMany({ where: buildInvoiceWhere(query), include: { customer: true }, take: 10000, orderBy: { invoiceDate: 'desc' } })
      header = ['Invoice', 'Customer', 'Status', 'Invoice Date', 'Due Date', 'Total Paise', 'Amount Paid']
      rows = items.map(item => [item.number, item.customer.name, item.status, item.invoiceDate.toISOString(), item.dueDate.toISOString(), item.total, item.amountPaid])
    } else if (query.report === 'overdue') {
      const items = await prisma.invoice.findMany({
        where: { ...buildInvoiceWhere(query), status: InvoiceStatus.CONFIRMED, dueDate: { lt: new Date() } },
        include: { customer: true },
        take: 10000,
      })
      header = ['Invoice', 'Customer', 'Due Date', 'Total Paise', 'Amount Paid', 'Outstanding']
      rows = items.filter(item => item.amountPaid < item.total).map(item => [item.number, item.customer.name, item.dueDate.toISOString(), item.total, item.amountPaid, item.total - item.amountPaid])
    } else {
      const items = await prisma.subscription.findMany({ where: buildSubscriptionWhere(query), include: { customer: true, plan: true }, take: 10000, orderBy: { createdAt: 'desc' } })
      header = ['Number', 'Customer', 'Plan', 'Status', 'Next Billing Date', 'Expiry Date']
      rows = items.map(item => [item.number, item.customer.name, item.plan.name, item.status, item.nextBillingDate.toISOString(), item.expiryDate.toISOString()])
    }

    const body = [header, ...rows].map(row => row.map(csv).join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="brightloop-${query.report}.csv"`)
    res.send(`\uFEFF${body}`)
  } catch (error) { next(error) }
})
