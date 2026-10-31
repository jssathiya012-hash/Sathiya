import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'local-development-secret-change-me',
  cookieSecret: process.env.COOKIE_SECRET ?? 'local-cookie-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  mailFrom: process.env.MAIL_FROM ?? 'Brightloop <no-reply@brightloop.local>',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}
