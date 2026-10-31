export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string[]>

  constructor(status: number, code: string, message: string, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = body.error ?? {}
    throw new ApiError(response.status, error.code ?? 'REQUEST_FAILED', error.message ?? 'Something went wrong.', error.fields)
  }
  return body as T
}
