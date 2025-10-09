type EmailVerificationTemplateInput = {
  otp: string
}

export const buildEmailVerificationTemplate = ({
  otp,
}: EmailVerificationTemplateInput) => ({
  subject: 'Verificación de correo electrónico',
  html: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Verificación de correo electrónico</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 24px; color: #111827; }
    .wrapper { max-width: 520px; margin: 0 auto; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    p { margin: 0 0 16px 0; line-height: 1.5; }
    .code { display: inline-block; padding: 12px 20px; border-radius: 12px; border: 1px dashed #6366f1; font-size: 24px; font-weight: 600; letter-spacing: 6px; color: #111827; }
    .footer { font-size: 12px; color: #6b7280; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1>Confirma tu correo</h1>
    <p>Usa el siguiente código para completar la verificación de tu correo electrónico.</p>
    <p><span class="code">${otp}</span></p>
    <p>El código vence en 10 minutos. Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
    <p class="footer">Equipo Cáritas Lima</p>
  </div>
</body>
</html>`,
})
