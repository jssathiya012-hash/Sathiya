import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { authRequired } from '../../middleware/auth.js'
import { z } from 'zod'
import { validateQuery } from '../../middleware/validate.js'

export const notificationsRouter = Router()
notificationsRouter.use(authRequired)

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

notificationsRouter.get('/', validateQuery(listSchema), async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { customerId: req.user!.id, status: 'ACTIVE' },
      include: { plan: true },
    })
    for (const subscription of subscriptions) {
      const days = Math.ceil((subscription.nextBillingDate.getTime() - Date.now()) / 86400000)
      if (days === 7 || days === 1) {
        const existing = await prisma.notification.findFirst({
          where: { userId: req.user!.id, type: 'RENEWAL_REMINDER', title: `Renewal in ${days} day${days === 1 ? '' : 's'}` },
        })
        if (!existing) {
          await prisma.notification.create({
            data: { userId: req.user!.id, type: 'RENEWAL_REMINDER', title: `Renewal in ${days} day${days === 1 ? '' : 's'}`, body: `${subscription.plan.name} renews soon.` },
          })
        }
      }
    }
    const overdue = await prisma.invoice.findMany({
      where: { customerId: req.user!.id, status: 'CONFIRMED', dueDate: { lt: new Date() } },
      select: { id: true, number: true },
    })
    for (const invoice of overdue) {
      const existing = await prisma.notification.findFirst({
        where: { userId: req.user!.id, type: 'INVOICE_OVERDUE', body: { contains: invoice.number } },
      })
      if (!existing) {
        await prisma.notification.create({ data: { userId: req.user!.id, type: 'INVOICE_OVERDUE', title: 'Invoice overdue', body: `Invoice ${invoice.number} is overdue and needs payment.` } })
      }
    }
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const where = { userId: req.user!.id }
    const [items, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' } }),
      prisma.notification.count({ where: { userId: req.user!.id, readAt: null } }),
      prisma.notification.count({ where }),
    ])
    res.json({ items, unreadCount, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

notificationsRouter.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } })
    res.json({ message: 'All notifications marked as read.' })
  } catch (error) { next(error) }
})

notificationsRouter.post('/:id/read', async (req, res, next) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0] ?? ''
    const notification = await prisma.notification.findFirst({ where: { id, userId: req.user!.id } })
    if (!notification) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found.' } }); return }
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } })
    res.json(notification)
  } catch (error) { next(error) }
})
