import { Router } from 'express'
import crypto from 'node:crypto'
import { InvoiceStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { writeAudit } from '../../lib/audit.js'
import { sendEmail } from '../../lib/mailer.js'
import { createInvoicePdf } from '../../lib/pdf.js'
import { recordPaymentSchema, mockPaymentSchema } from './payments.schemas.js'

export const paymentsRouter = Router()
paymentsRouter.use(authRequired)

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  method: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  customerId: z.string().optional(),
})

const routeId = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : value?.[0] ?? ''

const applySuccessfulPayment = async (invoiceId: string, amount: number) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) throw Object.assign(new Error('Invoice not found.'), { status: 404, code: 'NOT_FOUND' })
  const newPaid = invoice.amountPaid + amount
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: newPaid,
      status: newPaid >= invoice.total ? InvoiceStatus.PAID : InvoiceStatus.CONFIRMED,
    },
  })
  return newPaid
}

// Every customer payment list is filtered by the logged-in customer id.
paymentsRouter.get('/', validateQuery(listSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const where: any = {}
    if (req.user!.role === Role.CUSTOMER) where.customerId = req.user!.id
    else if (req.query.customerId) where.customerId = String(req.query.customerId)
    if (req.query.method) where.method = req.query.method
    if (req.query.status) where.status = req.query.status
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { invoice: { select: { id: true, number: true, total: true, status: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paidAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

paymentsRouter.post('/record', requireRole(Role.ADMIN, Role.STAFF), validateBody(recordPaymentSchema), async (req, res, next) => {
  try {
    const data = req.body as { invoiceId: string; amount: number; method: PaymentMethod; paidAt?: Date; note?: string }
    const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found.' } }); return }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      res.status(409).json({ error: { code: 'CANCELLED_INVOICE', message: 'Payments cannot be recorded on a cancelled invoice.' } })
      return
    }
    const outstanding = invoice.total - invoice.amountPaid
    if (data.amount > outstanding) {
      res.status(400).json({ error: { code: 'OVERPAYMENT', message: `The maximum payment is INR ${(outstanding / 100).toFixed(2)}.` } })
      return
    }
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        method: data.method,
        amount: data.amount,
        paidAt: data.paidAt ?? new Date(),
        note: data.note,
        status: PaymentStatus.SUCCESS,
        reference: `BL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      },
    })
    await applySuccessfulPayment(invoice.id, data.amount)
    await prisma.notification.create({ data: { userId: invoice.customerId, type: 'PAYMENT_RECEIVED', title: 'Payment received', body: `We received INR ${(data.amount / 100).toFixed(2)} for invoice ${invoice.number}.` } })
    await writeAudit(req.user!.id, 'RECORD_PAYMENT', 'PAYMENT', payment.id, { invoiceId: invoice.id, amount: data.amount })
    res.status(201).json(payment)
  } catch (error) { next(error) }
})

paymentsRouter.post('/mock-pay', validateBody(mockPaymentSchema), async (req, res, next) => {
  try {
    const data = req.body as { invoiceId: string; method: 'CARD' | 'UPI' | 'NETBANKING'; amount: number; force?: 'SUCCESS' | 'PENDING' | 'FAILURE' }
    const invoice = await prisma.invoice.findFirst({
      where: req.user!.role === Role.CUSTOMER ? { id: data.invoiceId, customerId: req.user!.id } : { id: data.invoiceId },
    })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found or access denied.' } }); return }
    if (invoice.status === InvoiceStatus.CANCELLED || invoice.status === InvoiceStatus.PAID) {
      res.status(409).json({ error: { code: 'INVALID_INVOICE', message: 'This invoice is not eligible for payment.' } })
      return
    }
    const outstanding = invoice.total - invoice.amountPaid
    if (data.amount > outstanding) {
      res.status(400).json({ error: { code: 'OVERPAYMENT', message: 'The payment is more than the amount outstanding.' } })
      return
    }
    const outcome = data.force ?? (Math.random() < 0.8 ? 'SUCCESS' : 'FAILURE')
    const status = outcome === 'SUCCESS' ? PaymentStatus.SUCCESS : outcome === 'PENDING' ? PaymentStatus.PENDING : PaymentStatus.FAILED
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        method: data.method as PaymentMethod,
        amount: data.amount,
        status,
        reference: `MOCK-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
        note: outcome === 'FAILURE' ? 'Demo payment failed. You can retry.' : outcome === 'PENDING' ? 'Waiting for gateway confirmation.' : 'Demo payment successful.',
      },
    })
    if (status === PaymentStatus.SUCCESS) {
      await applySuccessfulPayment(invoice.id, data.amount)
      await prisma.notification.create({ data: { userId: invoice.customerId, type: 'PAYMENT_RECEIVED', title: 'Payment received', body: `Payment of INR ${(data.amount / 100).toFixed(2)} was successful.` } })
      const customer = await prisma.user.findUnique({ where: { id: invoice.customerId } })
      if (customer) {
        await sendEmail(prisma, customer.id, customer.email, `Payment receipt for ${invoice.number}`, `Payment received: INR ${(data.amount / 100).toFixed(2)}.`)
      }
    } else if (status === PaymentStatus.FAILED) {
      await prisma.notification.create({ data: { userId: invoice.customerId, type: 'PAYMENT_FAILED', title: 'Payment failed', body: `Payment for invoice ${invoice.number} failed. Please retry.` } })
    }
    res.status(status === PaymentStatus.SUCCESS ? 201 : 200).json({ outcome, payment })
  } catch (error) { next(error) }
})

paymentsRouter.post('/:id/retry', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: req.user!.role === Role.CUSTOMER
        ? { id: routeId(req.params.id), customerId: req.user!.id, status: PaymentStatus.FAILED }
        : { id: routeId(req.params.id), status: PaymentStatus.FAILED },
    })
    if (!payment) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Failed payment not found or access denied.' } }); return }
    const retry = await prisma.payment.create({
      data: {
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        method: payment.method,
        amount: payment.amount,
        status: PaymentStatus.PENDING,
        reference: `RETRY-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
        note: 'Payment retry created.',
      },
    })
    res.status(201).json(retry)
  } catch (error) { next(error) }
})
