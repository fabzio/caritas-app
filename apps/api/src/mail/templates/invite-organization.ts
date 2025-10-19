export const buildInviteOrganizationTemplate = (params: {
  email: string
  invitedByUsername: string
  invitedByEmail: string
  teamName: string
  inviteLink: string
}) => {
  const { invitedByUsername, invitedByEmail, teamName, inviteLink } = params
  const primary = '#089c54'
  const foreground = '#32191b'
  const subtle = '#654f4e'
  const muted = '#f7e8e0'
  const border = '#e3d4cc'
  const safeInviteLink = encodeURI(inviteLink)
  return {
    subject: `Invitación para unirte a ${teamName} en Cáritas Lima`,
    html: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invitación a ${teamName}</title>
  <style>
    * { box-sizing: border-box }
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: ${foreground}; background: ${muted} }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid ${border} }
    .brand { display: inline-block; margin-bottom: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${primary} }
    h1 { font-size: 22px; margin: 0 0 16px 0 }
    p { margin: 0 0 16px 0; line-height: 1.6 }
    .lead { color: ${subtle}; font-size: 15px }
    .cta { display: inline-block; padding: 14px 22px; border-radius: 12px; background: ${primary}; color: #ffffff; text-decoration: none; font-weight: 600 }
    .fallback { margin-top: 16px; font-size: 14px; color: ${subtle}; word-break: break-all }
    .fallback a { color: ${primary}; text-decoration: none }
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
    <h1>Has sido invitado a ${teamName}</h1>
    <p>Hola,</p>
    <p class="lead">${invitedByUsername} (${invitedByEmail}) quiere que te unas a la organización <strong>${teamName}</strong> para colaborar en las iniciativas de Cáritas Lima.</p>
    <p><a class="cta" href="${safeInviteLink}" target="_blank" rel="noopener noreferrer">Aceptar invitación</a></p>
    <p class="fallback">Si el botón no funciona, abre este enlace en tu navegador<br /><a href="${safeInviteLink}" target="_blank" rel="noopener noreferrer">${safeInviteLink}</a></p>
    <p class="footer">Si no esperabas esta invitación, puedes ignorar este correo.</p>
  </div>
</body>
</html>`,
  }
}
