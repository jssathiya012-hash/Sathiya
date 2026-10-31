import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

export const validateBody = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the highlighted information.',
          fields: result.error.flatten().fieldErrors,
        },
      })
      return
    }
    req.body = result.data
    next()
  }

export const validateQuery = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters.', fields: result.error.flatten().fieldErrors } })
      return
    }
    req.query = result.data as typeof req.query
    next()
  }
