import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'
import { config } from '../config.js'

export const sendEmail = async (
  prisma: PrismaClient,
  userId: string | null,
  to: string,
  subject: string,
  body: string
) => {
  if (config.smtp.host && config.smtp.user) {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
    await transporter.sendMail({ from: config.mailFrom, to, subject, text: body })
  } else {
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${body}\n`)
  }
  await prisma.emailLog.create({ data: { userId, to, subject, body } })
}
