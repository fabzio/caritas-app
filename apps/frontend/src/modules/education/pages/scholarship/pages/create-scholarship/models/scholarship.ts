import { z } from 'zod'

export const formScholarShipSchema = z
  .object({
    name: z.string().nonempty('Ingrese el nombre de la beca'),
    description: z.string().nonempty('Ingrese una descripción de la beca'),
    requirements: z.string(),
    startDate: z.date({ message: 'La fecha de inicio es obligatoria' }),
    endDate: z.date({ message: 'La fecha de fin es obligatoria' }),
    type: z.enum(['ML', 'PL'], { message: 'Escoja el tipo de beca' }),
    organizationId: z.string({ message: 'Escoja la organización' }),
    vacancies: z
      .number({ error: 'Debe ingresar un número' })
      .min(1, { message: 'Las vacantes deben ser al menos 1' })
      .refine((v) => v !== undefined, {
        message: 'Las vacantes son obligatorias',
      }),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  })

export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>
