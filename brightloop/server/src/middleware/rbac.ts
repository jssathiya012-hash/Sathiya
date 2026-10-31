import type { NextFunction, Request, Response } from 'express'
import { Role } from '@prisma/client'

export const requireRole = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to do this.' } })
      return
    }
    next()
  }
