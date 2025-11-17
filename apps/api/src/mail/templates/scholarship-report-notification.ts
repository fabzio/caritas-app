type ScholarshipReportNotificationInput = {
  scholarshipName: string
  studentName: string
  reporterName: string
  cause: string
  baseUrl: string
  scholarshipId: number
}

export const buildScholarshipReportNotificationTemplate = ({
  scholarshipName,
  studentName,
  reporterName,
  cause,
  baseUrl,
  scholarshipId,
}: ScholarshipReportNotificationInput) => {
  const primary = '#089c54'
  const accent = '#dcfce7'
  const foreground = '#32191b'
  const subtle = '#654f4e'
  const muted = '#f7e8e0'
  const border = '#e3d4cc'
  const viewUrl = `${baseUrl}/education/scholarship/${scholarshipId}/view`

  const causeLabels: Record<string, string> = {
    absence: 'Inasistencia',
    performance: 'Bajo rendimiento',
    other: 'Otro',
  }

  return {
    subject: `Nuevo reporte de beca - ${scholarshipName}`,
    html: `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Notificación de Reporte de Beca</title>
  <style>
    * { box-sizing: border-box }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 0; padding: 24px; color: ${foreground}; background: ${muted} }
    .card { max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid ${border} }
    .brand { display: inline-block; margin-bottom: 20px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${primary} }
    h1 { margin: 0 0 12px 0; font-size: 22px }
    p { margin: 0 0 16px 0; line-height: 1.6 }
    .lead { color: ${subtle}; font-size: 15px }
    .info-box { padding: 16px; border-radius: 12px; background: ${accent}; margin: 20px 0; border-left: 4px solid ${primary} }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid ${border} }
    .info-row:last-child { border-bottom: none }
    .info-label { font-weight: 600; min-width: 120px; color: ${subtle}; font-size: 14px }
    .info-value { color: ${foreground}; font-size: 14px }
    .cta { display: inline-block; padding: 14px 22px; border-radius: 12px; text-decoration: none; font-weight: 600; color: #ffffff; background: ${primary}; margin: 16px 0 }
    .footer { font-size: 12px; color: #6b7280; margin-top: 28px; padding-top: 20px; border-top: 1px solid ${border} }
    @media (max-width: 520px) {
      .card { padding: 24px }
      .info-row { flex-direction: column }
      .info-label { min-width: auto; margin-bottom: 4px }
    }
  </style>
</head>
<body>
  <div class="card" role="article" aria-roledescription="email">
    <span class="brand">Cáritas Lima</span>
    <h1>Nuevo Reporte de Beca</h1>
    <p class="lead">Se ha registrado un nuevo reporte para uno de los estudiantes becados. A continuación se detallan los datos del reporte:</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Beca:</span>
        <span class="info-value">${scholarshipName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estudiante:</span>
        <span class="info-value">${studentName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Causa:</span>
        <span class="info-value">${causeLabels[cause] || cause}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reportado por:</span>
        <span class="info-value">${reporterName}</span>
      </div>
    </div>

    <p>Para revisar los detalles completos del reporte y tomar las acciones necesarias, accede al sistema:</p>
    <p><a class="cta" href="${viewUrl}">Ver Detalles de la Beca</a></p>
    
    <p class="footer">
      Este es un correo automático de notificación.<br/>
      Cáritas Lima - Sistema de Gestión de Becas
    </p>
  </div>
</body>
</html>`,
  }
}
