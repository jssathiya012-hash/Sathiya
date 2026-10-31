import { Role } from '@prisma/client'

export const canCreateDiscount = (role: Role) => role === Role.ADMIN

export const canAccessReports = (role: Role) =>
  role === Role.ADMIN || role === Role.STAFF
