import { da } from 'date-fns/locale'
import { z } from 'zod'

export const formFairSchema = z
  .object({
    name: z.string().nonempty('Ingrese el nombre de la feria vocacional'),
    date: z.date({ message: 'La fecha de la feria es obligatoria' }),
    location: z
      .string()
      .nonempty('Ingrese la ubicación de la feria vocacional'),
    startTime: z.string().nonempty('Ingrese la hora de inicio de la feria'),
    endTime: z.string().nonempty('Ingrese la hora de fin de la feria'),
    regionId: z.number().min(1, { message: 'Debes seleccionar una región' }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['endTime'],
  })

export type FormFairSchema = z.infer<typeof formFairSchema>
