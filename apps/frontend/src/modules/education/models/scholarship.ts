import { z } from 'zod'

export const formScholarShipSchema = z
  .object({
    name: z.string(),
    organizationName: z.string(),
    description: z.string(),
    requirements: z.string(),
    vacanties: z.number().min(1),
    startOfDate: z.date(),
    endOfDate: z.date(),
    type: z.enum(['modular', 'studiesPlan']),
    organizationId: z.string(),
  })
  .refine((data) => data.startOfDate < data.endOfDate, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  })

export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>
