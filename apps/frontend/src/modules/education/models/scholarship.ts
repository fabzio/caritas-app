import { z } from 'zod'

export const formScholarShipSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    requirements: z.string(),
    vacancies: z.number().min(1, 'Debe haber al menos una vacante'),
    startDate: z.date(),
    endDate: z.date(),
    type: z.enum(['ML', 'PL']),
    organizationId: z.string(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  })

export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>
