import { z } from 'zod'

export const formScholarShipSchema = z
  .object({
    name: z
      .string()
      .trim()
      .nonempty('Ingrese el nombre de la beca')
      .refine((val) => val.length > 0, {
        message: 'El nombre no puede contener solo espacios',
      })
      .refine((val) => !/^\d+$/.test(val), {
        message: 'El nombre no puede contener solo números',
      })
      .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
        message: 'El nombre no puede contener solo símbolos',
      })
      .max(100, { message: 'El nombre no debe superar los 100 caracteres' }),
    description: z
      .string()
      .trim()
      .nonempty('Ingrese una descripción de la beca')
      .refine((val) => val.length > 0, {
        message: 'La descripción no puede contener solo espacios',
      })
      .refine((val) => !/^\d+$/.test(val), {
        message: 'La descripción no puede contener solo números',
      })
      .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
        message: 'La descripción no puede contener solo símbolos',
      }),
    requirements: z.string().trim(),
    startDate: z.date({ message: 'La fecha de inicio es obligatoria' }),
    endDate: z.date({ message: 'La fecha de fin es obligatoria' }),
    type: z.enum(['ML', 'PL'], { message: 'Escoja el tipo de beca' }),
    organizationId: z.string({ message: 'Escoja la organización' }),
    vacancies: z.coerce
      .number({ error: 'Debe ingresar un número' })
      .min(1, { message: 'Ingrese un número válido de vacantes' })
      .max(9999, { message: 'Ingrese un número válido de vacantes' })
      .refine((v) => v !== undefined, {
        message: 'Las vacantes son obligatorias',
      }),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
  })

export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>
