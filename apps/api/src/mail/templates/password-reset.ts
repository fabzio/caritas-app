type PasswordResetTemplateInput = {
  otp: string
  email: string
  baseUrl: string
}

export const buildPasswordResetTemplate = ({
  otp,
  email,
  baseUrl,
}: PasswordResetTemplateInput) => {
  const primary = '#089c54'
  const accent = '#dcfce7'
  const foreground = '#32191b'
  const subtle = '#654f4e'
  const muted = '#f7e8e0'
  const border = '#e3d4cc'
  const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
  return {
    subject: 'Recuperación de contraseña',
    html: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Recuperación de contraseña</title>
  <style>
    * { box-sizing: border-box }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 0; padding: 24px; color: ${foreground}; background: ${muted} }
    .card { max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid ${border} }
    .brand { display: inline-block; margin-bottom: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${primary} }
    h1 { margin: 0 0 12px 0; font-size: 22px }
    p { margin: 0 0 16px 0; line-height: 1.6 }
    .lead { color: ${subtle}; font-size: 15px }
    .code { display: inline-block; margin: 16px 0; padding: 14px 24px; border-radius: 12px; border: 2px dashed ${primary}; background: ${accent}; font-size: 26px; font-weight: 700; letter-spacing: 6px; color: ${foreground} }
    .cta { display: inline-block; padding: 14px 22px; border-radius: 12px; text-decoration: none; font-weight: 600; color: #ffffff; background: ${primary} }
    .link { font-size: 14px; color: ${primary}; word-break: break-all }
    .info { font-size: 14px; color: ${subtle} }
    .footer { font-size: 12px; color: #6b7280; margin-top: 28px }
    @media (max-width: 520px) {
      .card { padding: 24px }
      .cta { display: block; text-align: center }
    }
  </style>
</head>
<body>
  <div class="card" role="article" aria-roledescription="email">
    <span class="brand">Cáritas Lima</span>
    <h1>Restablece tu acceso</h1>
    <p class="lead">Utiliza el código de verificación o continúa desde el enlace seguro para crear una nueva contraseña.</p>
    <p><span class="code">${otp}</span></p>
    <p><a class="cta" href="${resetUrl}">Restablecer contraseña</a></p>
    <p class="link">${resetUrl}</p>
    <p class="info">El código vence en 10 minutos. Si no solicitaste este proceso, ignora este correo.</p>
    <p class="footer">Cáritas Lima</p>
  </div>
</body>
</html>`,
  }
}
