import { data } from 'happy-dom/lib/PropertySymbol'
import { z } from 'zod'

export const formFairSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(200, {
        message: 'El nombre de la feria no debe superar los 200 caracteres',
      })
      .nonempty('Ingrese el nombre de la feria vocacional')
      .refine((val) => val.length > 0, {
        message: 'El nombre de la feria no puede contener solo espacios',
      })
      .refine((val) => !/^\d+$/.test(val), {
        message: 'El nombre de la feria no puede contener solo números',
      })
      .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
        message: 'El nombre de la feria no puede contener solo símbolos',
      }),
    date: z.date({ message: 'La fecha de la feria es obligatoria' }),
    address: z
      .string()
      .trim()
      .nonempty('Ingrese la ubicación de la feria vocacional')
      .max(200, { message: 'La dirección no debe superar los 200 caracteres' })
      .refine((val) => val.length > 0, {
        message: 'La ubicación no puede contener solo espacios',
      })
      .refine((val) => !/^\d+$/.test(val), {
        message: 'La ubicación no puede contener solo números',
      })
      .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
        message: 'La ubicación no puede contener solo símbolos',
      }),
    startTime: z.string().nonempty('Ingrese la hora de inicio de la feria'),
    endTime: z.string().nonempty('Ingrese la hora de fin de la feria'),
    regionId: z
      .number()
      .min(1, { message: 'Debes seleccionar una región' })
      .refine((val) => val !== null && val !== undefined, {
        message: 'Debes seleccionar una región',
      }),
    organizations: z
      .array(
        z.object({
          organizationId: z.string().min(1, 'Seleccione una organización'),
        }),
      )
      .min(1, 'Debe haber al menos una organización'),
  })

  .refine((data) => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['endTime'],
  })

export type FormFairSchema = z.infer<typeof formFairSchema>
