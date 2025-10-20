type VerificationEmailParams = {
  type: 'email-verification' | 'forget-password' | 'sign-in'
  otp: string
  email: string
  baseUrl: string
}

const palette = {
  primary: '#089c54',
  foreground: '#32191b',
  muted: '#f7e8e0',
  subtle: '#654f4e',
  border: '#e3d4cc',
}

const layout = (title: string, body: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: ${palette.muted}; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid ${palette.border}; padding: 32px;">
      <span style="display: inline-block; margin-bottom: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${palette.primary};">Cáritas Lima</span>
      <h1 style="margin: 0 0 12px; font-size: 22px; color: ${palette.foreground};">${title}</h1>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${palette.subtle};">${body}</p>
    </div>
    <p style="max-width: 520px; margin: 24px auto 0; font-size: 12px; text-align: center; color: #6b7280;">
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
        `Tu código de verificación es <span style="font-weight: 700; color: ${palette.primary};">${otp}</span>. Introduce este código para activar tu cuenta.`,
      ),
    }
  }

  if (type === 'forget-password') {
    const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
    return {
      subject: 'Recuperación de contraseña',
      html: layout(
        'Restablece tu contraseña',
        `Usa el código <span style="font-weight: 700; color: ${palette.primary};">${otp}</span> o accede a través de <a href="${resetUrl}" style="color: ${palette.primary}; text-decoration: none;">este enlace seguro</a>. El código es válido por 10 minutos.`,
      ),
    }
  }

  return {
    subject: 'Inicio de sesión con código',
    html: layout(
      'Tu código de acceso',
      `Introduce el código <span style="font-weight: 700; color: ${palette.primary};">${otp}</span> para completar tu inicio de sesión.`,
    ),
  }
}
