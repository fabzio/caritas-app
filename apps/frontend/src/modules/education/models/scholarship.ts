import { z } from 'zod'

export const formScholarShipSchema = z
  .object({
    name: z.string().nonempty('El nombre es obligatorio'),
    description: z.string().nonempty('La descripción es obligatoria'),
    requirements: z.string(),
    vacancies: z.number().nullable(),
    startDate: z.date({ message: 'La fecha de inicio es obligatoria' }),
    endDate: z.date({ message: 'La fecha de fin es obligatoria' }),
    type: z.enum(['ML', 'PL'], { message: 'El tipo de beca es obligatorio' }),
    organizationId: z.string(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  })
  .refine((data) => data.organizationId !== '#', {
    message: 'Debe seleccionar una organización',
    path: ['organizationId'],
  })

export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>
