import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { isStrongPassword } from '../../lib/password.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { writeAudit } from '../../lib/audit.js'
import { paginationSchema } from '../../lib/pagination.js'

export const usersRouter = Router()
usersRouter.use(authRequired, requireRole(Role.ADMIN))

const staffSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
})

usersRouter.get('/staff', validateQuery(paginationSchema.extend({ search: z.string().optional() })), async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const search = String(req.query.search ?? '')
    const where = {
      role: Role.STAFF,
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ])
    res.json({ items: items.map(({ passwordHash, ...item }) => item), page: { page, limit, total, pageCount: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/staff', validateBody(staffSchema), async (req, res, next) => {
  try {
    const { name, email } = req.body as { name: string; email: string }
    const temporaryPassword = `Staff${crypto.randomBytes(3).toString('hex')}!A`
    if (!isStrongPassword(temporaryPassword)) throw new Error('Generated password was invalid')
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(temporaryPassword, 12), role: Role.STAFF },
    })
    await writeAudit(req.user!.id, 'CREATE', 'STAFF', user.id, { email })
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, temporaryPassword })
  } catch (error) {
    next(error)
  }
})

usersRouter.patch('/staff/:id/deactivate', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user || user.role !== Role.STAFF) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Staff account not found.' } })
      return
    }
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } })
    await writeAudit(req.user!.id, 'DEACTIVATE', 'STAFF', user.id, { email: user.email })
    res.json({ message: 'Staff account deactivated.' })
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/staff/:id/reset-password', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user || user.role !== Role.STAFF) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Staff account not found.' } })
      return
    }
    const temporaryPassword = `Staff${crypto.randomBytes(4).toString('hex')}!A`
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(temporaryPassword, 12) } })
    await writeAudit(req.user!.id, 'RESET_PASSWORD', 'STAFF', user.id, { email: user.email })
    res.json({ message: 'Password reset.', temporaryPassword })
  } catch (error) {
    next(error)
  }
})
