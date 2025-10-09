type VerificationEmailParams = {
  type: 'email-verification' | 'forget-password' | 'sign-in'
  otp: string
  email: string
  baseUrl: string
}

const layout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);">
      <h1 style="margin: 0 0 16px; font-size: 22px; color: #1f2937;">${title}</h1>
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563;">${body}</p>
    </div>
    <p style="max-width: 480px; margin: 24px auto 0; font-size: 12px; text-align: center; color: #6b7280;">
      Cáritas Lima • Este es un correo automático, por favor no responder.
    </p>
  </div>
`

export const buildVerificationOtpEmail = ({
  type,
  otp,
  email,
  baseUrl,
}: VerificationEmailParams) => {
  if (type === 'email-verification') {
    return {
      subject: 'Verificación de correo electrónico',
      html: layout(
        'Confirma tu correo electrónico',
        `Tu código de verificación es <span style="font-weight: 600; color: #1d4ed8;">${otp}</span>. Introduce este código para activar tu cuenta.`,
      ),
    }
  }

  if (type === 'forget-password') {
    const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    return {
      subject: 'Recuperación de contraseña',
      html: layout(
        'Restablece tu contraseña',
        `Usa el código <span style="font-weight: 600; color: #1d4ed8;">${otp}</span> o haz clic <a href="${resetUrl}" style="color: #2563eb; text-decoration: none;">aquí</a> para restablecer tu contraseña. Este código es válido por 10 minutos.`,
      ),
    }
  }

  return {
    subject: 'Inicio de sesión con código',
    html: layout(
      'Tu código de acceso',
      `Introduce el código <span style="font-weight: 600; color: #1d4ed8;">${otp}</span> para completar tu inicio de sesión.`,
    ),
  }
}
