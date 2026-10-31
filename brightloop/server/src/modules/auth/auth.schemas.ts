import { z } from 'zod'
import { isStrongPassword, passwordRulesMessage } from '../../lib/password.js'

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().trim().email('Enter a valid email address.').transform(value => value.toLowerCase()),
  password: z.string().refine(isStrongPassword, passwordRulesMessage),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').transform(value => value.toLowerCase()),
  password: z.string().min(1, 'Enter your password.'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').transform(value => value.toLowerCase()),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'This reset link is invalid.'),
  password: z.string().refine(isStrongPassword, passwordRulesMessage),
})
