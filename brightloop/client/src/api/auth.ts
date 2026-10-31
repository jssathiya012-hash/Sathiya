import { api } from './client'
import type { User } from '../types/auth'

export const authApi = {
  me: () => api<User>('/api/auth/me'),
  login: (email: string, password: string) =>
    api<User>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name: string, email: string, password: string) =>
    api<User>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => api<void>('/api/auth/logout', { method: 'POST', body: '{}' }),
  forgotPassword: (email: string) =>
    api<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
}
