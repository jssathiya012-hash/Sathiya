import { Router } from 'express'
import { InvoiceStatus, Role, PaymentStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { writeAudit } from '../../lib/audit.js'
import { sendEmail } from '../../lib/mailer.js'
import { createInvoicePdf } from '../../lib/pdf.js'
import { invoiceListSchema } from './invoices.schemas.js'

export const invoicesRouter = Router()
invoicesRouter.use(authRequired)

const routeId = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : value?.[0] ?? ''

// Customer invoice lookups always include customerId; staff/admin may view any invoice.
invoicesRouter.get('/', validateQuery(invoiceListSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const status = req.query.status as string | undefined
    const today = new Date()
    let where: any = {}
    if (req.user!.role === Role.CUSTOMER) where.customerId = req.user!.id
    else if (req.query.customerId) where.customerId = String(req.query.customerId)
    if (status === 'OVERDUE') {
      where.status = InvoiceStatus.CONFIRMED
      where.dueDate = { lt: today }
      where.amountPaid = { lt: prisma.invoice.fields.total }
    } else if (status) {
      where.status = status as InvoiceStatus
    }
    if (req.query.search) {
      where.number = { contains: String(req.query.search) }
    }
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, profile: true } },
          subscription: { include: { plan: { include: { product: true } } } },
          lines: true,
          payments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

// The id and current customer id are checked together for customer isolation.
invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const where: any = { id: routeId(req.params.id) }
    if (req.user!.role === Role.CUSTOMER) where.customerId = req.user!.id
    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, profile: true } },
        subscription: { include: { plan: { include: { product: true } } } },
        lines: true,
        payments: true,
      },
    })
    if (!invoice) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found or access denied.' } })
      return
    }
    res.json(invoice)
  } catch (error) { next(error) }
})

invoicesRouter.post('/:id/confirm', requireRole(Role.ADMIN, Role.STAFF), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found.' } }); return }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      res.status(409).json({ error: { code: 'INVALID_STATUS_JUMP', message: 'Only draft invoices can be confirmed.' } })
      return
    }
    await prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.CONFIRMED } })
    await prisma.notification.create({ data: { userId: invoice.customerId, type: 'INVOICE_GENERATED', title: 'Invoice ready', body: `Invoice ${invoice.number} is ready for payment.` } })
    await writeAudit(req.user!.id, 'CONFIRM', 'INVOICE', id, { number: invoice.number })
    res.json({ message: 'Invoice confirmed.' })
  } catch (error) { next(error) }
})

invoicesRouter.post('/:id/cancel', requireRole(Role.ADMIN, Role.STAFF), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found.' } }); return }
    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      res.status(409).json({ error: { code: 'INVALID_STATUS_JUMP', message: 'This invoice cannot be cancelled.' } })
      return
    }
    await prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.CANCELLED } })
    await writeAudit(req.user!.id, 'CANCEL', 'INVOICE', id, { number: invoice.number })
    res.json({ message: 'Invoice cancelled.' })
  } catch (error) { next(error) }
})

invoicesRouter.post('/:id/send', requireRole(Role.ADMIN, Role.STAFF), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, lines: true },
    })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found.' } }); return }
    const pdf = await createInvoicePdf({
      number: invoice.number,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      total: invoice.total,
      customerName: invoice.customer.name,
    })
    void pdf
    await sendEmail(prisma, invoice.customerId, invoice.customer.email, `Invoice ${invoice.number}`, `A copy of your Brightloop invoice is ready. Amount: INR ${(invoice.total / 100).toFixed(2)}.`)
    await writeAudit(req.user!.id, 'SEND', 'INVOICE', id, { number: invoice.number })
    res.json({ message: 'Invoice sent by email.' })
  } catch (error) { next(error) }
})

invoicesRouter.get('/:id/pdf', async (req, res, next) => {
  try {
    const where: any = { id: routeId(req.params.id) }
    if (req.user!.role === Role.CUSTOMER) where.customerId = req.user!.id
    const invoice = await prisma.invoice.findFirst({ where, include: { customer: true } })
    if (!invoice) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found or access denied.' } }); return }
    const pdf = await createInvoicePdf({
      number: invoice.number,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      total: invoice.total,
      customerName: invoice.customer.name,
    })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`)
    res.send(pdf)
  } catch (error) { next(error) }
})
