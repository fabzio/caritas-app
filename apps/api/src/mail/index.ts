import env from '@api/env'
import nodemailer from 'nodemailer'

export const SENDER =
  env.NODE_ENV === 'production'
    ? 'Caritas Auth <no-reply@caritas.fabzio.ip-ddns.com>'
    : '[Dev] Caritas Auth <no-reply@caritas.dev.fabzio.ip-ddns.com>'
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
