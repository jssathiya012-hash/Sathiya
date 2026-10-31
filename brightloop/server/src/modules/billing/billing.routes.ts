import { Router } from 'express'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'
import { validateBody } from '../../middleware/validate.js'
import { runBillingJob } from '../../jobs/billing.js'

export const billingRouter = Router()
billingRouter.use(authRequired, requireRole(Role.ADMIN, Role.STAFF))

billingRouter.post('/run', validateBody(z.object({ dryRun: z.boolean().default(false) })), async (req, res, next) => {
  try {
    const { dryRun } = req.body as { dryRun: boolean }
    const summary = await runBillingJob(dryRun)
    res.json(summary)
  } catch (error) { next(error) }
})
