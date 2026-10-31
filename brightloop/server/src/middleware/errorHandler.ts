import type { NextFunction, Request, Response } from 'express'

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'The requested information could not be found.' } })
}

export const errorHandler = (
  error: { status?: number; code?: string; message?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error.code === 'P2002') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'An account or record with this information already exists.' } })
    return
  }
  res.status(error.status ?? 500).json({
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message: error.status ? error.message : 'Something went wrong. Please try again.',
    },
  })
}
