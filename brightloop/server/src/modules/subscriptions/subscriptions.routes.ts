import { Router } from 'express'
import { Role, SubscriptionStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { paginationSchema } from '../../lib/pagination.js'
import { writeAudit } from '../../lib/audit.js'
import { prorateAmount } from '../../lib/dates.js'
import { canTransitionSubscription, subscriptionExpiryForPeriod } from '../../lib/subscriptionRules.js'
import { calculatePriceBreakdown } from '../../lib/money.js'
import { createSubscriptionSchema, changePlanSchema, actionSchema } from './subscriptions.schemas.js'

export const subscriptionsRouter = Router()
subscriptionsRouter.use(authRequired)

const listSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  customerId: z.string().optional(),
})

const nextNumber = async () => {
  const count = await prisma.subscription.count()
  return `SUB-${String(count + 1).padStart(6, '0')}`
}

const routeId = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : value?.[0] ?? ''

const ownershipWhere = (req: any, extra: object = {}) => {
  if (req.user?.role === Role.CUSTOMER) {
    return { ...extra, customerId: req.user.id }
  }
  return extra
}

// Lists always include customerId for customer users; admin/staff may filter broadly.
subscriptionsRouter.get('/', validateQuery(listSchema), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const status = req.query.status ? { status: req.query.status as SubscriptionStatus } : {}
    const where = ownershipWhere(req, {
      ...status,
      ...(req.query.customerId && req.user?.role !== Role.CUSTOMER ? { customerId: String(req.query.customerId) } : {}),
      ...(req.query.search ? { number: { contains: String(req.query.search) } } : {}),
    })
    const [items, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { plan: { include: { product: true } }, lines: true, customer: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

// Customer detail lookups combine the id with the logged-in customer id.
subscriptionsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const subscription = await prisma.subscription.findFirst({
      where: ownershipWhere(req, { id }),
      include: {
        plan: { include: { product: { include: { variants: true } } } },
        lines: { include: { product: true, variant: true, tax: true } },
        events: { orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true } } } },
        customer: { select: { id: true, name: true, email: true, profile: true } },
      },
    })
    if (!subscription) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found or access denied.' } })
      return
    }
    res.json(subscription)
  } catch (error) { next(error) }
})

subscriptionsRouter.post('/pricing/preview', validateBody(z.object({
  planId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  variantId: z.string().optional(),
  discountCode: z.string().trim().optional(),
})), async (req, res, next) => {
  try {
    const body = req.body as { planId: string; quantity: number; variantId?: string; discountCode?: string }
    const plan = await prisma.plan.findFirst({
      where: req.user?.role === Role.CUSTOMER ? { id: body.planId, isActive: true } : { id: body.planId },
      include: { product: { include: { taxRules: { include: { tax: true } } } } },
    })
    if (!plan) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plan not found.' } })
      return
    }
    if (body.quantity < plan.minQuantity) {
      res.status(400).json({ error: { code: 'MINIMUM_QUANTITY', message: `Choose at least ${plan.minQuantity} items.` } })
      return
    }
    const variant = body.variantId
      ? await prisma.productVariant.findFirst({ where: { id: body.variantId, productId: plan.productId } })
      : null
    const tax = plan.product.taxRules.find(rule => rule.tax.isActive)?.tax
    let discount = 0
    if (body.discountCode) {
      const rule = await prisma.discount.findFirst({
        where: { name: body.discountCode, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        include: { products: true },
      })
      if (!rule || rule.usedCount >= rule.usageLimit) {
        res.status(400).json({ error: { code: 'DISCOUNT_NOT_APPLICABLE', message: 'This discount is expired, used up, or is not valid.' } })
        return
      }
      const subtotal = plan.price * body.quantity + (variant?.extraPrice ?? 0) * body.quantity
      if (body.quantity < rule.minQuantity || subtotal < rule.minPurchase) {
        res.status(400).json({ error: { code: 'DISCOUNT_NOT_APPLICABLE', message: `This discount needs at least ${rule.minQuantity} items or a higher purchase amount.` } })
        return
      }
      discount = rule.type === 'PERCENT'
        ? Math.round(subtotal * rule.value / 100)
        : Math.min(subtotal, rule.value)
    }
    const base = plan.price * body.quantity
    const variantExtras = (variant?.extraPrice ?? 0) * body.quantity
    const taxable = base + variantExtras - discount
    const breakdown = calculatePriceBreakdown({
      basePricePaise: plan.price,
      variantExtraPaise: variant?.extraPrice ?? 0,
      quantity: body.quantity,
      discountFixedPaise: discount,
      taxPercent: tax?.ratePercent ?? 0,
    })
    res.json({
      planId: plan.id,
      quantity: body.quantity,
      variantId: variant?.id ?? null,
      breakdown,
      taxable,
      billingPeriod: plan.billingPeriod,
    })
  } catch (error) { next(error) }
})

subscriptionsRouter.post('/', requireRole(Role.ADMIN, Role.STAFF, Role.CUSTOMER), validateBody(createSubscriptionSchema), async (req, res, next) => {
  try {
    const body = req.body as { customerId?: string; planId: string; templateId?: string; paymentTerms: string; startDate?: Date; quantity?: number; variantId?: string }
    const customerId = req.user?.role === Role.CUSTOMER ? req.user.id : body.customerId
    if (!customerId) {
      res.status(400).json({ error: { code: 'CUSTOMER_REQUIRED', message: 'Choose a customer for this subscription.' } })
      return
    }
    const customer = await prisma.user.findUnique({ where: { id: customerId } })
    if (!customer || customer.role !== Role.CUSTOMER) {
      res.status(404).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found.' } })
      return
    }
    const template = body.templateId
      ? await prisma.quotationTemplate.findUnique({ where: { id: body.templateId }, include: { lines: true } })
      : null
    const plan = await prisma.plan.findUnique({
      where: { id: template?.planId ?? body.planId },
      include: { product: true },
    })
    if (!plan || !plan.isActive) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plan not found or is inactive.' } })
      return
    }
    const quantity = Math.max(body.quantity ?? plan.minQuantity, plan.minQuantity)
    const startDate = body.startDate ?? new Date()
    const expiryDate = subscriptionExpiryForPeriod(startDate, plan.billingPeriod)
    const nextBillingDate = subscriptionExpiryForPeriod(startDate, plan.billingPeriod)
    const number = await nextNumber()
    const variant = body.variantId
      ? await prisma.productVariant.findFirst({ where: { id: body.variantId, productId: plan.productId } })
      : null
    const tax = await prisma.tax.findFirst({ where: { isActive: true, products: { some: { productId: plan.productId } } } })
    const subscription = await prisma.subscription.create({
      data: {
        number,
        customerId,
        planId: plan.id,
        startDate,
        expiryDate,
        paymentTerms: body.paymentTerms,
        status: SubscriptionStatus.DRAFT,
        nextBillingDate,
        createdById: req.user!.id,
        lines: {
          create: template?.lines.map(line => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: plan.price,
            taxId: tax?.id,
            amount: plan.price * line.quantity,
          })) ?? [{
            productId: plan.productId,
            variantId: variant?.id,
            quantity,
            unitPrice: plan.price + (variant?.extraPrice ?? 0),
            taxId: tax?.id,
            amount: (plan.price + (variant?.extraPrice ?? 0)) * quantity,
          }],
        },
        events: { create: { type: 'CREATED', note: 'Subscription created', actorId: req.user!.id } },
      },
      include: { lines: true, events: true },
    })
    await writeAudit(req.user!.id, 'CREATE', 'SUBSCRIPTION', subscription.id, { number, customerId, planId: plan.id })
    res.status(201).json(subscription)
  } catch (error) { next(error) }
})

subscriptionsRouter.patch('/:id/confirm', async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const subscription = await prisma.subscription.findFirst({ where: ownershipWhere(req, { id }), include: { plan: true } })
    if (!subscription) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found.' } }); return }
    if (subscription.status !== SubscriptionStatus.DRAFT && subscription.status !== SubscriptionStatus.QUOTATION) {
      res.status(409).json({ error: { code: 'INVALID_STATUS_JUMP', message: `Cannot confirm a subscription in ${subscription.status} status.` } })
      return
    }
    await prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CONFIRMED, events: { create: { type: 'CONFIRMED', note: 'Subscription confirmed', actorId: req.user!.id } } },
    })
    res.json({ message: 'Subscription confirmed.' })
  } catch (error) { next(error) }
})

subscriptionsRouter.post('/:id/activate', requireRole(Role.ADMIN, Role.STAFF), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const subscription = await prisma.subscription.findUnique({ where: { id }, include: { plan: true } })
    if (!subscription) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found.' } }); return }
    if (subscription.status !== SubscriptionStatus.CONFIRMED) {
      res.status(409).json({ error: { code: 'INVALID_STATUS_JUMP', message: 'Only a confirmed subscription can become active.' } })
      return
    }
    await prisma.subscription.update({ where: { id }, data: { status: SubscriptionStatus.ACTIVE, events: { create: { type: 'ACTIVATED', actorId: req.user!.id } } } })
    res.json({ message: 'Subscription activated.' })
  } catch (error) { next(error) }
})

subscriptionsRouter.post('/:id/:action', validateBody(actionSchema), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const action = String(req.params.action ?? '')
    const subscription = await prisma.subscription.findFirst({ where: ownershipWhere(req, { id }), include: { plan: true } })
    if (!subscription) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found.' } }); return }
    const reason = (req.body as { reason?: string }).reason
    let target: SubscriptionStatus | null = null
    if (action === 'pause') target = SubscriptionStatus.PAUSED
    if (action === 'resume') target = SubscriptionStatus.ACTIVE
    if (action === 'close') target = SubscriptionStatus.CLOSED
    if (action === 'renew' && subscription.plan.allowRenew) target = SubscriptionStatus.ACTIVE
    if (!target) {
      res.status(400).json({ error: { code: 'ACTION_NOT_ALLOWED', message: 'This action is not available.' } })
      return
    }
    if (!canTransitionSubscription(subscription.status, target, subscription.plan)) {
      res.status(409).json({ error: { code: 'INVALID_STATUS_JUMP', message: `The subscription cannot be changed from ${subscription.status} to ${target}.` } })
      return
    }
    const updateData: any = {
      status: target,
      events: { create: { type: action.toUpperCase(), note: reason ?? `${action} subscription`, actorId: req.user!.id } },
    }
    if (action === 'renew') updateData.nextBillingDate = subscriptionExpiryForPeriod(subscription.nextBillingDate, subscription.plan.billingPeriod)
    await prisma.subscription.update({ where: { id }, data: updateData })
    await writeAudit(req.user!.id, action.toUpperCase(), 'SUBSCRIPTION', id, { reason })
    res.json({ message: `Subscription ${action === 'close' ? 'closed' : action + 'd'}.` })
  } catch (error) { next(error) }
})

subscriptionsRouter.post('/:id/change-plan', validateBody(changePlanSchema), async (req, res, next) => {
  try {
    const id = routeId(req.params.id)
    const { planId, preview } = req.body as { planId: string; preview: boolean }
    const subscription = await prisma.subscription.findFirst({ where: ownershipWhere(req, { id }), include: { plan: true } })
    if (!subscription) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found.' } }); return }
    const newPlan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!newPlan || !newPlan.isActive) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'New plan not found.' } }); return }
    const oldPeriodStart = new Date(subscription.startDate)
    const oldPeriodEnd = subscription.nextBillingDate
    const proration = prorateAmount(subscription.plan.price, newPlan.price, oldPeriodStart, oldPeriodEnd)
    if (preview) {
      res.json({ preview: true, ...proration, newPlan: { id: newPlan.id, name: newPlan.name, price: newPlan.price } })
      return
    }
    await prisma.subscription.update({
      where: { id },
      data: { planId: newPlan.id, events: { create: { type: 'UPGRADED', note: `Changed plan to ${newPlan.name}`, actorId: req.user!.id } } },
    })
    await writeAudit(req.user!.id, 'CHANGE_PLAN', 'SUBSCRIPTION', id, { oldPlanId: subscription.planId, newPlanId: planId, proration })
    res.json({ message: 'Plan changed.', proration })
  } catch (error) { next(error) }
})
