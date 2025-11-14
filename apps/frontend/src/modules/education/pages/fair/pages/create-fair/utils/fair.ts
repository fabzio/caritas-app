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
    assistanceCount: z
      .number({
        invalid_type_error: 'Ingresa un número válido de asistentes',
      })
      .int('El número de asistentes debe ser un número entero')
      .min(0, {
        message: 'La cantidad de asistentes no puede ser negativa',
      })
      .optional(),
  })

  .refine((data) => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la hora de fin',
    path: ['endTime'],
  })
  .superRefine((data, ctx) => {
    if (data.assistanceCount === undefined || data.assistanceCount === null) {
      return
    }

    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Solo puedes registrar asistentes cuando la feria ya terminó',
        path: ['assistanceCount'],
      })
      return
    }

    const today = new Date()
    const fairDate = new Date(data.date)

    const normalizeDate = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const normalizedToday = normalizeDate(today)
    const normalizedFairDate = normalizeDate(fairDate)

    const isPastDate = normalizedFairDate.getTime() < normalizedToday.getTime()
    const isSameDay = normalizedFairDate.getTime() === normalizedToday.getTime()

    const currentTime = today.toTimeString().slice(0, 8)
    const hasEndedToday = isSameDay && data.endTime <= currentTime

    if (!isPastDate && !hasEndedToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Solo puedes registrar asistentes cuando la feria ya terminó',
        path: ['assistanceCount'],
      })
    }
  })

export type FormFairSchema = z.infer<typeof formFairSchema>
