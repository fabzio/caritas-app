import env from '@api/env'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.GOOGLE_SMTP_USER,
    pass: env.GOOGLE_SMTP_APP_PASSWORD,
  },
})

export default transporter
