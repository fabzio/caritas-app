import { z } from 'zod'

export const participantSchema = z.object({
  alliedId: z.string().min(1, 'Seleccione un aliado'),
  specialityIds: z
    .array(z.number())
    .min(1, 'Seleccione al menos una especialidad'),
})

const today = new Date()
today.setHours(0, 0, 0, 0)

export const createCompleteActivitySchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .refine((val) => val.trim().length > 0, 'El nombre no puede estar vacío'),
  date: z.date({ message: 'La fecha es requerida' }).refine((d) => {
    const dd = new Date(d)
    dd.setHours(0, 0, 0, 0)
    return dd.getTime() >= today.getTime()
  }, 'La fecha no puede ser anterior al día actual'),
  durationHours: z.coerce
    .number({ message: 'Seleccione la duración' })
    .min(1, 'La duración debe ser al menos 1 hora')
    .max(20, 'La duración no puede exceder 20 horas') as unknown as z.ZodNumber,
  regionId: z.number({ message: 'Seleccione un distrito' }),
  address: z
    .string()
    .min(1, 'La dirección es requerida')
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .refine(
      (val) => val.trim().length > 0,
      'La dirección no puede estar vacía',
    ),
  typeId: z.number({ message: 'Seleccione un tipo de actividad' }),
  statusId: z.number({ message: 'Seleccione un estado' }),
  participants: z
    .array(participantSchema)
    .min(1, 'Debe agregar al menos un participante'),
})

export type CreateCompleteActivityFormSchema = z.infer<
  typeof createCompleteActivitySchema
>
