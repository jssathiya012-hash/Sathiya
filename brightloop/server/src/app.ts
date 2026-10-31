import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { usersRouter } from './modules/users/users.routes.js'
import { catalogueRouter } from './modules/catalogue/catalogue.routes.js'
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes.js'
import { invoicesRouter } from './modules/invoices/invoices.routes.js'
import { paymentsRouter } from './modules/payments/payments.routes.js'
import { notificationsRouter } from './modules/notifications/notifications.routes.js'
import { billingRouter } from './modules/billing/billing.routes.js'
import { reportsRouter } from './modules/reports/reports.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

export const app = express()
app.use(helmet())
app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
// Lightweight request timing makes slow endpoints visible during local demos.
app.use((req, res, next) => {
  const started = performance.now()
  res.on('finish', () => {
    if (req.path.startsWith('/api/reports')) {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} in ${Math.round(performance.now() - started)} ms`)
    }
  })
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/catalogue', catalogueRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/billing', billingRouter)
app.use('/api/reports', reportsRouter)
app.use(notFound)
app.use(errorHandler)
