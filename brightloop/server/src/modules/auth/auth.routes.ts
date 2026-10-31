import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma.js'
import { config } from '../../config.js'
import { isStrongPassword } from '../../lib/password.js'
import { sendEmail } from '../../lib/mailer.js'
import { validateBody } from '../../middleware/validate.js'
import { authRequired, type AuthUser } from '../../middleware/auth.js'
import { loginRateLimit, forgotRateLimit } from '../../middleware/rateLimit.js'
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schemas.js'

export const authRouter = Router()

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
}

const publicUser = (user: { id: string; name: string; email: string; role: 'ADMIN' | 'STAFF' | 'CUSTOMER' }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
})

authRouter.post('/signup', validateBody(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'An account already uses this email address.' } })
      return
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'CUSTOMER', profile: { create: {} } },
    })
    const payload: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    res.cookie('brightloop_session', jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' }), cookieOptions)
    res.status(201).json(publicUser(user))
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', loginRateLimit, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } })
      return
    }
    const payload: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    res.cookie('brightloop_session', jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' }), cookieOptions)
    res.json(publicUser(user))
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('brightloop_session', { httpOnly: true, sameSite: 'lax', path: '/' })
  res.status(204).send()
})

authRouter.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user || !user.isActive) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please log in to continue.' } })
      return
    }
    res.json(publicUser(user))
  } catch (error) {
    next(error)
  }
})

authRouter.post('/forgot-password', forgotRateLimit, validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body as { email: string }
    const user = await prisma.user.findUnique({ where: { email } })
    if (user?.isActive) {
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      })
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      })
      const resetLink = `http://localhost:5173/reset-password/${token}`
      await sendEmail(prisma, user.id, user.email, 'Reset your Brightloop password', `Use this link within 30 minutes:\n${resetLink}`)
    }
    res.json({ message: 'If that email belongs to an account, a reset link has been sent.' })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body as { token: string; password: string }
    if (!isStrongPassword(password)) {
      res.status(400).json({ error: { code: 'WEAK_PASSWORD', message: 'Please choose a stronger password.' } })
      return
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      res.status(400).json({ error: { code: 'INVALID_RESET_TOKEN', message: 'This reset link is invalid or has expired.' } })
      return
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ])
    res.json({ message: 'Password updated. You can now log in.' })
  } catch (error) {
    next(error)
  }
})
