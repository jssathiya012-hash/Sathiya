import { Router } from 'express'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { writeAudit } from '../../lib/audit.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { paginationSchema } from '../../lib/pagination.js'
import {
  productSchema, variantSchema, planSchema, taxSchema, discountSchema, templateSchema,
} from './catalogue.schemas.js'

export const catalogueRouter = Router()

const listQuery = paginationSchema.extend({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
})

const getPage = (req: any) => ({
  page: Number(req.query.page ?? 1),
  limit: Number(req.query.limit ?? 20),
})

const paramId = (req: any) =>
  Array.isArray(req.params.id) ? req.params.id[0] ?? '' : req.params.id

const activeWhere = (req: any, extras: object = {}) => ({
  ...extras,
  ...(req.user?.role === Role.CUSTOMER ? { isActive: true } : {}),
})

catalogueRouter.use(authRequired)

// Products: admin and staff may read; admin writes.
catalogueRouter.get('/products', validateQuery(listQuery), async (req, res, next) => {
  try {
    const { page, limit } = getPage(req)
    const search = String(req.query.search ?? '')
    const where = activeWhere(req, search ? { name: { contains: search } } : {})
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, include: { variants: true, taxRules: { include: { tax: true } } }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

catalogueRouter.get('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: activeWhere(req, { id: paramId(req) }),
      include: { variants: true, plans: true, taxRules: { include: { tax: true } } },
    })
    if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }); return }
    res.json(product)
  } catch (error) { next(error) }
})

catalogueRouter.post('/products', requireRole(Role.ADMIN), validateBody(productSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body })
    await writeAudit(req.user!.id, 'CREATE', 'PRODUCT', product.id, { name: product.name })
    res.status(201).json(product)
  } catch (error) { next(error) }
})

catalogueRouter.patch('/products/:id', requireRole(Role.ADMIN), validateBody(productSchema.partial()), async (req, res, next) => {
  try {
    const product = await prisma.product.update({ where: { id: paramId(req) }, data: req.body })
    await writeAudit(req.user!.id, 'UPDATE', 'PRODUCT', product.id, { name: product.name })
    res.json(product)
  } catch (error) { next(error) }
})

// Variants can be read with products; creating or editing them is admin-only.
catalogueRouter.post('/variants', requireRole(Role.ADMIN), validateBody(variantSchema), async (req, res, next) => {
  try {
    const variant = await prisma.productVariant.create({ data: req.body })
    await writeAudit(req.user!.id, 'CREATE', 'PRODUCT_VARIANT', variant.id, { value: variant.value })
    res.status(201).json(variant)
  } catch (error) { next(error) }
})

catalogueRouter.patch('/variants/:id', requireRole(Role.ADMIN), validateBody(variantSchema.partial().omit({ productId: true })), async (req, res, next) => {
  try {
    const variant = await prisma.productVariant.update({ where: { id: paramId(req) }, data: req.body })
    await writeAudit(req.user!.id, 'UPDATE', 'PRODUCT_VARIANT', variant.id, { value: variant.value })
    res.json(variant)
  } catch (error) { next(error) }
})

// Plans are visible to customers only when active and currently available.
catalogueRouter.get('/plans', validateQuery(listQuery), async (req, res, next) => {
  try {
    const { page, limit } = getPage(req)
    const search = String(req.query.search ?? '')
    const where: any = search ? { name: { contains: search } } : {}
    if (req.user?.role === Role.CUSTOMER) {
      where.isActive = true
      where.availableFrom = { lte: new Date() }
      where.availableTo = { gte: new Date() }
    } else if (req.query.isActive) {
      where.isActive = req.query.isActive === 'true'
    }
    const [items, total] = await Promise.all([
      prisma.plan.findMany({ where, include: { product: { include: { variants: true } } }, skip: (page - 1) * limit, take: limit }),
      prisma.plan.count({ where }),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

catalogueRouter.get('/plans/:id', async (req, res, next) => {
  try {
    const where: any = { id: paramId(req) }
    if (req.user?.role === Role.CUSTOMER) {
      where.isActive = true
      where.availableFrom = { lte: new Date() }
      where.availableTo = { gte: new Date() }
    }
    const plan = await prisma.plan.findFirst({ where, include: { product: { include: { variants: true, taxRules: { include: { tax: true } } } } } })
    if (!plan) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plan not found.' } }); return }
    res.json(plan)
  } catch (error) { next(error) }
})

catalogueRouter.post('/plans', requireRole(Role.ADMIN), validateBody(planSchema), async (req, res, next) => {
  try {
    const plan = await prisma.plan.create({ data: req.body })
    await writeAudit(req.user!.id, 'CREATE', 'PLAN', plan.id, { name: plan.name })
    res.status(201).json(plan)
  } catch (error) { next(error) }
})

catalogueRouter.patch('/plans/:id', requireRole(Role.ADMIN), validateBody(planSchema.partial()), async (req, res, next) => {
  try {
    const plan = await prisma.plan.update({ where: { id: paramId(req) }, data: req.body })
    await writeAudit(req.user!.id, 'UPDATE', 'PLAN', plan.id, { name: plan.name, isActive: plan.isActive })
    res.json(plan)
  } catch (error) { next(error) }
})

// Tax rules are read-only for staff and customers.
catalogueRouter.get('/taxes', requireRole(Role.ADMIN, Role.STAFF), validateQuery(listQuery), async (req, res, next) => {
  try {
    const { page, limit } = getPage(req)
    const [items, total] = await Promise.all([
      prisma.tax.findMany({ include: { products: { include: { product: true } } }, skip: (page - 1) * limit, take: limit }),
      prisma.tax.count(),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

catalogueRouter.post('/taxes', requireRole(Role.ADMIN), validateBody(taxSchema), async (req, res, next) => {
  try {
    const { productIds = [], ...taxData } = req.body as z.infer<typeof taxSchema>
    const tax = await prisma.tax.create({
      data: { ...taxData, products: { create: productIds.map(productId => ({ productId })) } },
    })
    await writeAudit(req.user!.id, 'CREATE', 'TAX', tax.id, { name: tax.name })
    res.status(201).json(tax)
  } catch (error) { next(error) }
})

catalogueRouter.patch('/taxes/:id', requireRole(Role.ADMIN), validateBody(taxSchema.partial()), async (req, res, next) => {
  try {
    const { productIds, ...taxData } = req.body as Partial<z.infer<typeof taxSchema>>
    if (productIds) {
      const id = paramId(req)
      await prisma.taxProduct.deleteMany({ where: { taxId: id } })
      await prisma.taxProduct.createMany({ data: productIds.map(productId => ({ taxId: id, productId })) })
    }
    const tax = await prisma.tax.update({ where: { id: paramId(req) }, data: taxData })
    await writeAudit(req.user!.id, 'UPDATE', 'TAX', tax.id, { name: tax.name })
    res.json(tax)
  } catch (error) { next(error) }
})

// Discount endpoints are admin-only for writes, with staff able to read usage.
catalogueRouter.get('/discounts', requireRole(Role.ADMIN, Role.STAFF), validateQuery(listQuery), async (req, res, next) => {
  try {
    const { page, limit } = getPage(req)
    const [items, total] = await Promise.all([
      prisma.discount.findMany({ include: { products: { include: { product: true } } }, skip: (page - 1) * limit, take: limit, orderBy: { endDate: 'asc' } }),
      prisma.discount.count(),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

catalogueRouter.post('/discounts', requireRole(Role.ADMIN), validateBody(discountSchema), async (req, res, next) => {
  try {
    const { productIds = [], ...data } = req.body as z.infer<typeof discountSchema>
    const discount = await prisma.discount.create({ data: { ...data, products: { create: productIds.map(productId => ({ productId })) } } })
    await writeAudit(req.user!.id, 'CREATE', 'DISCOUNT', discount.id, { name: discount.name })
    res.status(201).json(discount)
  } catch (error) { next(error) }
})

catalogueRouter.patch('/discounts/:id', requireRole(Role.ADMIN), validateBody(discountSchema.partial()), async (req, res, next) => {
  try {
    const { productIds, ...data } = req.body as Partial<z.infer<typeof discountSchema>>
    if (productIds) {
      const id = paramId(req)
      await prisma.discountProduct.deleteMany({ where: { discountId: id } })
      await prisma.discountProduct.createMany({ data: productIds.map(productId => ({ discountId: id, productId })) })
    }
    const discount = await prisma.discount.update({ where: { id: paramId(req) }, data })
    await writeAudit(req.user!.id, 'UPDATE', 'DISCOUNT', discount.id, { name: discount.name })
    res.json(discount)
  } catch (error) { next(error) }
})

// Quotation templates are operational records for admin and staff.
catalogueRouter.get('/templates', requireRole(Role.ADMIN, Role.STAFF), validateQuery(listQuery), async (req, res, next) => {
  try {
    const { page, limit } = getPage(req)
    const [items, total] = await Promise.all([
      prisma.quotationTemplate.findMany({ include: { plan: { include: { product: true } }, lines: true }, skip: (page - 1) * limit, take: limit }),
      prisma.quotationTemplate.count(),
    ])
    res.json({ items, page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) { next(error) }
})

catalogueRouter.post('/templates', requireRole(Role.ADMIN, Role.STAFF), validateBody(templateSchema), async (req, res, next) => {
  try {
    const { lines, ...data } = req.body as z.infer<typeof templateSchema>
    const template = await prisma.quotationTemplate.create({
      data: { ...data, lines: { create: lines } },
      include: { lines: true },
    })
    await writeAudit(req.user!.id, 'CREATE', 'QUOTATION_TEMPLATE', template.id, { name: template.name })
    res.status(201).json(template)
  } catch (error) { next(error) }
})
