import { z } from 'zod'
export const reportSchema = z.object({
  userId: z.string().min(1, 'El nombre del alumno es requerido'),
  cause: z.string().min(1, 'Debe especificar una causa'),
  causeDetail: z.string().min(1, 'Debe detallar la causa'),
  reason: z.string().optional(),
  reasonDetail: z.string().optional(),
})

export type FormReportSchema = z.infer<typeof reportSchema>
