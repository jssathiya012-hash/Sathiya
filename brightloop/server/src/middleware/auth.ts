import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { config } from '../config.js'

export interface AuthUser {
  id: string
  role: Role
  name: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.brightloop_session as string | undefined
  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please log in to continue.' } })
    return
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthUser
    next()
  } catch {
    res.status(401).json({ error: { code: 'INVALID_SESSION', message: 'Your session has expired. Please log in again.' } })
  }
}
