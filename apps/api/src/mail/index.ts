import env from '@api/env'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  requireTLS: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
})

export default transporter
