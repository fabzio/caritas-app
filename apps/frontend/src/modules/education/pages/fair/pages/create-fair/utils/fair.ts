import { z } from 'zod'

export const formFairSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(200, {
        message: 'El nombre de la feria no debe superar los 200 caracteres',
      })
      .nonempty('Ingrese el nombre de la feria vocacional'),
    date: z.date({ message: 'La fecha de la feria es obligatoria' }),
    address: z
      .string()
      .trim()
      .nonempty('Ingrese la ubicación de la feria vocacional')
      .max(200, { message: 'La dirección no debe superar los 200 caracteres' }),
    startTime: z
      .string()
      .trim()
      .nonempty('Ingrese la hora de inicio de la feria'),
    endTime: z.string().trim().nonempty('Ingrese la hora de fin de la feria'),
    regionId: z.number().min(1, { message: 'Debes seleccionar una región' }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['endTime'],
  })

export type FormFairSchema = z.infer<typeof formFairSchema>
