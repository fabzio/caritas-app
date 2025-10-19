type SignInTemplateInput = {
  otp: string
}

export const buildSignInTemplate = ({ otp }: SignInTemplateInput) => {
  const primary = '#089c54'
  const accent = '#dcfce7'
  const foreground = '#32191b'
  const subtle = '#654f4e'
  const muted = '#f7e8e0'
  const border = '#e3d4cc'
  return {
    subject: 'Inicio de sesión seguro',
    html: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inicio de sesión seguro</title>
  <style>
    * { box-sizing: border-box }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 0; padding: 24px; color: ${foreground}; background: ${muted} }
    .card { max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid ${border} }
    .brand { display: inline-block; margin-bottom: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${primary} }
    h1 { margin: 0 0 12px 0; font-size: 22px }
    p { margin: 0 0 16px 0; line-height: 1.6 }
    .lead { color: ${subtle}; font-size: 15px }
    .code { display: inline-block; margin: 16px 0; padding: 14px 24px; border-radius: 12px; border: 2px dashed ${primary}; background: ${accent}; font-size: 26px; font-weight: 700; letter-spacing: 6px; color: ${foreground} }
    .info { font-size: 14px; color: ${subtle} }
    .footer { font-size: 12px; color: #6b7280; margin-top: 28px }
    @media (max-width: 520px) {
      .card { padding: 24px }
      .code { width: 100%; text-align: center; font-size: 22px; letter-spacing: 4px }
    }
  </style>
</head>
<body>
  <div class="card" role="article" aria-roledescription="email">
    <span class="brand">Cáritas Lima</span>
    <h1>Verificación de acceso</h1>
    <p class="lead">Introduce el código temporal para completar tu inicio de sesión seguro.</p>
    <p><span class="code">${otp}</span></p>
    <p class="info">El código vence en 10 minutos. Si no solicitaste el acceso, ignora este correo.</p>
    <p class="footer">Cáritas Lima</p>
  </div>
</body>
</html>`,
  }
}
